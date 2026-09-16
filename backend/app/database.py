"""Configuração do banco de dados SQLite com SQLAlchemy."""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Caminho absoluto determinístico para o banco SQLite na raiz do backend ou configurável via ENV
BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "jobmatcher.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")

# check_same_thread=False é fundamental para o FastAPI que trabalha com threads assíncronas
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Classe base para todos os modelos."""
    pass


def get_db():
    """Gera uma sessão do banco para uso com Depends() do FastAPI com encerramento garantido."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def criar_tabelas():
    """Cria todas as tabelas no banco se não existirem."""
    Base.metadata.create_all(bind=engine)

