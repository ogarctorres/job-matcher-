"""Testes para o módulo de segurança nativa JWT e rotas de autenticação SQLite."""

import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException

from app.main import app
from app.core.seguranca import (
    gerar_hash_senha,
    verificar_senha,
    gerar_token_jwt,
    validar_token_jwt,
)

client = TestClient(app)


def test_gerar_hash_e_verificar_senha():
    """Garante hashing seguro de senhas com PBKDF2 e validação em tempo constante."""
    senha = "MinhaSenhaForte2026!#"
    hash_senha = gerar_hash_senha(senha)

    assert hash_senha != senha
    assert "$" in hash_senha
    assert verificar_senha(senha, hash_senha) is True
    assert verificar_senha("SenhaIncorreta", hash_senha) is False
    assert verificar_senha(senha, "hash_invalido_sem_cifrao") is False


def test_gerar_e_validar_token_jwt():
    """Garante que geração e decodificação de JWT preservam a identidade do usuário."""
    dados_usuario = {
        "id": "user-uuid-9999",
        "email": "dev@vektor.com",
        "nome": "Desenvolvedor Vektor",
        "role": "authenticated",
    }

    token = gerar_token_jwt(dados_usuario, expira_em_minutos=60)
    assert isinstance(token, str)
    assert len(token) > 20

    dados_validados = validar_token_jwt(token)
    assert dados_validados["id"] == "user-uuid-9999"
    assert dados_validados["email"] == "dev@vektor.com"
    assert dados_validados["nome"] == "Desenvolvedor Vektor"


def test_token_jwt_expirado_rejeitado():
    """Garante que tokens vencidos são rejeitados com HTTP 401 e mensagem clara."""
    dados_usuario = {"id": "user-expirado", "email": "exp@vektor.com"}
    token_expirado = gerar_token_jwt(dados_usuario, expira_em_minutos=-10)

    with pytest.raises(HTTPException) as exc_info:
        validar_token_jwt(token_expirado)

    assert exc_info.value.status_code == 401
    assert "Sessão expirada" in exc_info.value.detail


def test_token_jwt_invalido_ou_vazio():
    """Garante que tokens vazios ou adulterados são rejeitados."""
    with pytest.raises(HTTPException) as exc_info:
        validar_token_jwt("")
    assert exc_info.value.status_code == 401

    with pytest.raises(HTTPException) as exc_info:
        validar_token_jwt("token.completamente.falso")
    assert exc_info.value.status_code == 401


def test_endpoint_cadastro_e_login_fluxo_completo():
    """Testa o fluxo ponta a ponta: cadastro -> login -> consulta de perfil /auth/me."""
    import uuid
    email_unico = f"usuario_{uuid.uuid4().hex[:8]}@vektor.com"
    senha_teste = "SenhaSecreta2026!"
    nome_teste = "Ana Paula Dev"

    # 1. Cadastro
    res_cadastro = client.post(
        "/auth/cadastro",
        json={"email": email_unico, "senha": senha_teste, "nome": nome_teste},
    )
    assert res_cadastro.status_code == 201
    payload_cad = res_cadastro.json()
    assert "access_token" in payload_cad
    assert payload_cad["usuario"]["email"] == email_unico
    assert payload_cad["usuario"]["nome"] == nome_teste
    assert "senha" not in payload_cad["usuario"]
    assert "senha_hash" not in payload_cad["usuario"]

    # 2. Cadastro duplicado deve falhar
    res_duplicado = client.post(
        "/auth/cadastro",
        json={"email": email_unico, "senha": senha_teste, "nome": nome_teste},
    )
    assert res_duplicado.status_code == 400

    # 3. Login com senha correta
    res_login = client.post(
        "/auth/login",
        json={"email": email_unico, "senha": senha_teste},
    )
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # 4. Login com senha errada
    res_login_erro = client.post(
        "/auth/login",
        json={"email": email_unico, "senha": "SenhaTotalmenteErrada"},
    )
    assert res_login_erro.status_code == 401

    # 5. Consulta de sessão /auth/me
    res_me = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_me.status_code == 200
    assert res_me.json()["email"] == email_unico
    assert res_me.json()["nome"] == nome_teste


def test_endpoint_cadastro_email_invalido():
    """Garante que formato de e-mail inválido retorna 400."""
    res = client.post(
        "/auth/cadastro",
        json={"email": "email-sem-arroba", "senha": "123456Senha", "nome": "Teste"},
    )
    assert res.status_code == 400
