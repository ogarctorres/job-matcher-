"""Modelos de dados — Análise de currículo e Histórico de Currículos Adaptados."""

import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class CurriculoAdaptado(Base):
    """Representa uma versão de currículo gerada/otimizada para vaga específica ou geral ATS."""
    __tablename__ = "curriculos_adaptados"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analise_id = Column(Integer, ForeignKey("analises.id", ondelete="CASCADE"), nullable=True, index=True)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    titulo_vaga = Column(String(500), default="Vaga Alvo")
    modo = Column(String(50), default="otimizado_para_vaga")
    score_compatibilidade = Column(Float, default=0)
    resultado_json = Column(Text, nullable=False)  # JSON string com todo o payload da adaptação

    @property
    def resultado(self) -> dict:
        return json.loads(self.resultado_json) if self.resultado_json else {}

    @resultado.setter
    def resultado(self, valor: dict):
        self.resultado_json = json.dumps(valor, ensure_ascii=False)

    def to_dict(self) -> dict:
        """Converte o currículo adaptado para dicionário de retorno na API."""
        return {
            "id": self.id,
            "analise_id": self.analise_id,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "titulo_vaga": self.titulo_vaga,
            "modo": self.modo,
            "score_compatibilidade": self.score_compatibilidade,
            "resultado": self.resultado,
        }


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

    # Relacionamento com adaptações geradas a partir desta análise
    adaptacoes = relationship(
        "CurriculoAdaptado",
        backref="analise",
        cascade="all, delete-orphan",
        order_by="desc(CurriculoAdaptado.criado_em)",
        lazy="select",
    )

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
            "total_adaptacoes": len(self.adaptacoes) if self.adaptacoes else 0,
            "adaptacoes": [a.to_dict() for a in self.adaptacoes] if self.adaptacoes else [],
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
            "total_adaptacoes": len(self.adaptacoes) if self.adaptacoes else 0,
        }
