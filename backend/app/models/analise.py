"""Modelo de Análise — representa uma análise completa de currículo."""

import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from app.database import Base


class Analise(Base):
    __tablename__ = "analises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Dados do currículo
    texto_curriculo = Column(Text, nullable=False)
    dados_curriculo_json = Column(Text, nullable=False)  # JSON string

    # Avaliação
    nota_geral = Column(Float, default=0)
    avaliacao_json = Column(Text, nullable=False)  # JSON string

    # Vagas
    vagas_json = Column(Text, default="[]")  # JSON string

    @property
    def dados_curriculo(self) -> dict:
        return json.loads(self.dados_curriculo_json)

    @dados_curriculo.setter
    def dados_curriculo(self, valor: dict):
        self.dados_curriculo_json = json.dumps(valor, ensure_ascii=False)

    @property
    def avaliacao(self) -> dict:
        return json.loads(self.avaliacao_json)

    @avaliacao.setter
    def avaliacao(self, valor: dict):
        self.avaliacao_json = json.dumps(valor, ensure_ascii=False)

    @property
    def vagas(self) -> list:
        return json.loads(self.vagas_json)

    @vagas.setter
    def vagas(self, valor: list):
        self.vagas_json = json.dumps(valor, ensure_ascii=False)

    def to_dict(self) -> dict:
        """Converte para dicionário para retorno na API."""
        return {
            "id": self.id,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "dados_curriculo": self.dados_curriculo,
            "avaliacao": self.avaliacao,
            "nota_geral": self.nota_geral,
            "vagas_encontradas": self.vagas,
        }

    def to_resumo(self) -> dict:
        """Versão resumida para listagem."""
        dados = self.dados_curriculo
        return {
            "id": self.id,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "nota_geral": self.nota_geral,
            "cargo_objetivo": dados.get("cargo_objetivo", ""),
            "skills": dados.get("skills", []),
            "total_vagas": len(self.vagas),
        }
