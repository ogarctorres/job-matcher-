"""Modelo de dados para Usuário do sistema."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.database import Base


class Usuario(Base):
    """Representa um usuário cadastrado na aplicação com credenciais e perfil armazenados no SQLite."""
    __tablename__ = "usuarios"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    nome = Column(String(255), nullable=False)
    plano = Column(String(50), default="Gratuito")
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        """Serializa o usuário para respostas públicas da API (sem expor o hash de senha)."""
        return {
            "id": self.id,
            "email": self.email,
            "nome": self.nome,
            "plano": self.plano,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
        }
