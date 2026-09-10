"""Configuração do banco de dados SQLite com SQLAlchemy."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///jobmatcher.db"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    """Classe base para todos os modelos."""
    pass


def get_db():
    """Gera uma sessão do banco para uso com Depends() do FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def criar_tabelas():
    """Cria todas as tabelas no banco se não existirem."""
    Base.metadata.create_all(bind=engine)
