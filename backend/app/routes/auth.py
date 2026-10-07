"""Rotas de autenticação nativa (Cadastro, Login e Consulta de Sessão)."""

import re
import logging
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.core.seguranca import (
    gerar_hash_senha,
    verificar_senha,
    gerar_token_jwt,
    obter_usuario_atual,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Autenticação"])

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[a-zA-Z0-9\.\-]+$")


class CadastroRequest(BaseModel):
    email: str = Field(..., description="E-mail profissional ou pessoal do usuário")
    senha: str = Field(..., min_length=6, description="Senha de acesso (mínimo 6 caracteres)")
    nome: str = Field(..., min_length=2, description="Nome completo do usuário")


class LoginRequest(BaseModel):
    email: str = Field(..., description="E-mail cadastrado")
    senha: str = Field(..., min_length=1, description="Senha do usuário")


@router.post("/cadastro", status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(dados: CadastroRequest, db: Session = Depends(get_db)):
    """Cadastra um novo usuário com credenciais locais salvas no SQLite e retorna token JWT."""
    email_formatado = dados.email.strip().lower()

    if not EMAIL_REGEX.match(email_formatado):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de e-mail inválido. Insira um endereço de e-mail válido.",
        )

    existente = db.query(Usuario).filter(Usuario.email == email_formatado).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado no sistema. Faça login.",
        )

    novo_usuario = Usuario(
        email=email_formatado,
        nome=dados.nome.strip(),
        senha_hash=gerar_hash_senha(dados.senha),
        plano="Gratuito",
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    usuario_dict = novo_usuario.to_dict()
    token = gerar_token_jwt(usuario_dict)

    logger.info(f"[auth] Novo usuário cadastrado: {novo_usuario.email} ({novo_usuario.id})")

    return {
        "access_token": token,
        "token": token,
        "token_type": "bearer",
        "usuario": usuario_dict,
    }


@router.post("/login")
def login_usuario(dados: LoginRequest, db: Session = Depends(get_db)):
    """Autentica o usuário com e-mail e senha no SQLite e emite um token de sessão JWT."""
    email_formatado = dados.email.strip().lower()

    usuario = db.query(Usuario).filter(Usuario.email == email_formatado).first()
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas. Verifique seu e-mail e senha.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario_dict = usuario.to_dict()
    token = gerar_token_jwt(usuario_dict)

    logger.info(f"[auth] Login realizado com sucesso: {usuario.email}")

    return {
        "access_token": token,
        "token": token,
        "token_type": "bearer",
        "usuario": usuario_dict,
    }


@router.get("/me")
def obter_usuario_me(
    usuario_atual: dict = Depends(obter_usuario_atual),
    db: Session = Depends(get_db),
):
    """Retorna os dados do perfil do usuário autenticado a partir do token ou SQLite."""
    user_id = usuario_atual.get("id")
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()

    if usuario:
        return usuario.to_dict()

    # Caso de usuário de teste em mock de testes
    return {
        "id": user_id,
        "email": usuario_atual.get("email", ""),
        "nome": usuario_atual.get("nome", "Usuário"),
        "plano": "Gratuito",
        "criado_em": None,
    }
