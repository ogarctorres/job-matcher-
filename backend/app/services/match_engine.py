"""
Motor de Cálculo Matemático Determinístico e Auditável do Vektor.

Elimina variações aleatórias de scores gerados por LLMs e garante
transparência total para o candidato sobre como a nota foi computada.

Fórmula:
Score = (Matches Obrigatórios / Total Obrigatórios * 60) +
        (Matches Desejáveis / Total Desejáveis * 25) +
        (Formação e Contexto * 15)

Regra de Teto (Dealbreaker):
Se alerta_eliminatorio.inelegivel for True, o score máximo é limitado a 50%.
"""

import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

PESO_OBRIGATORIOS_MAX = 60.0
PESO_DESEJAVEIS_MAX = 25.0
PESO_FORMACAO_MAX = 15.0
TETO_DEALBREAKER = 50


def _pontuar_requisito(status: str) -> float:
    """
    Atribui peso numérico determinístico ao status do requisito.
    - MATCH: 1.0 (100%)
    - PARTIAL: 0.5 (50%)
    - UNKNOWN: 0.2 (20% - neutro)
    - GAP: 0.0 (0%)
    """
    s = (status or "").strip().upper()
    if s == "MATCH":
        return 1.0
    if s == "PARTIAL":
        return 0.5
    if s == "UNKNOWN":
        return 0.2
    return 0.0


def _avaliar_formacao_contexto(dados_curriculo: dict, texto_curriculo: str) -> Tuple[float, str]:
    """
    Avalia a aderência de formação e contexto geral do candidato (até 15 pontos).
    Garante pontuação proporcional para estudantes de computação, dados ou áreas correlatas.
    """
    texto = (texto_curriculo or "").lower()
    resumo = (dados_curriculo.get("resumo") or "").lower() if dados_curriculo else ""
    conteudo = f"{texto} {resumo}"

    termos_formacao_tech = [
        "computação", "computacao", "ciência da computação", "ciencia da computacao",
        "sistemas de informação", "sistemas de informacao", "análise e desenvolvimento",
        "analise e desenvolvimento", "engenharia de software", "engenharia da computação",
        "engenharia da computacao", "banco de dados", "tecnologia", "informática", "informatica"
    ]

    tem_formacao_tech = any(termo in conteudo for termo in termos_formacao_tech)
    tem_projetos = any(termo in conteudo for termo in ["projeto", "projetos", "github", "api", "sistema"])

    if tem_formacao_tech and tem_projetos:
        return PESO_FORMACAO_MAX, "Formação acadêmica em tecnologia com projetos práticos comprovados."
    elif tem_formacao_tech:
        return 10.0, "Formação acadêmica em tecnologia identificada."
    elif tem_projetos:
        return 8.0, "Projetos práticos identificados, formação geral ou em transição."
    else:
        return 5.0, "Perfil em fase inicial de desenvolvimento de portfólio."


def calcular_score_deterministico(
    analise_match: dict,
    alerta_eliminatorio: dict = None,
    dados_curriculo: dict = None,
    texto_curriculo: str = "",
    score_base_ia: int = None,
) -> Tuple[int, dict]:
    """
    Calcula o score de compatibilidade de forma 100% matemática, determinística e auditável.

    Retorna:
    (score_final: int, memoria_calculo: dict)
    """
    alerta = alerta_eliminatorio or {}
    dados_cv = dados_curriculo or {}
    match = analise_match or {}

    reqs_obrig = match.get("requisitos_obrigatorios", [])
    reqs_desej = match.get("requisitos_desejaveis", [])

    tem_requisitos_estruturados = bool(reqs_obrig or reqs_desej)

    if tem_requisitos_estruturados:
        # 1. Cálculo dos Requisitos Obrigatórios (até 60 pontos)
        if reqs_obrig:
            pontos_soma = sum(_pontuar_requisito(r.get("status")) for r in reqs_obrig)
            matches_obrig = sum(1 for r in reqs_obrig if (r.get("status") or "").upper() == "MATCH")
            parciais_obrig = sum(1 for r in reqs_obrig if (r.get("status") or "").upper() == "PARTIAL")
            gaps_obrig = sum(1 for r in reqs_obrig if (r.get("status") or "").upper() == "GAP")
            proporcao_obrig = pontos_soma / len(reqs_obrig)
            pontos_obrig = proporcao_obrig * PESO_OBRIGATORIOS_MAX
        else:
            matches_obrig, parciais_obrig, gaps_obrig = 0, 0, 0
            pontos_obrig = PESO_OBRIGATORIOS_MAX

        # 2. Cálculo dos Requisitos Desejáveis (até 25 pontos)
        if reqs_desej:
            pontos_soma_desej = sum(_pontuar_requisito(r.get("status")) for r in reqs_desej)
            matches_desej = sum(1 for r in reqs_desej if (r.get("status") or "").upper() == "MATCH")
            parciais_desej = sum(1 for r in reqs_desej if (r.get("status") or "").upper() == "PARTIAL")
            gaps_desej = sum(1 for r in reqs_desej if (r.get("status") or "").upper() == "GAP")
            proporcao_desej = pontos_soma_desej / len(reqs_desej)
            pontos_desej = proporcao_desej * PESO_DESEJAVEIS_MAX
        else:
            matches_desej, parciais_desej, gaps_desej = 0, 0, 0
            pontos_desej = PESO_DESEJAVEIS_MAX

        # 3. Formação e Contexto (até 15 pontos)
        pontos_formacao, justificativa_formacao = _avaliar_formacao_contexto(dados_cv, texto_curriculo)

        # 4. Soma Bruta
        score_bruto = max(0.0, min(100.0, pontos_obrig + pontos_desej + pontos_formacao))
    else:
        # Fallback gracioso se a análise não detalhou lista de requisitos
        score_bruto = float(score_base_ia) if score_base_ia is not None else 75.0
        pontos_obrig = round(score_bruto * 0.6, 1)
        pontos_desej = round(score_bruto * 0.25, 1)
        pontos_formacao = round(score_bruto * 0.15, 1)
        matches_obrig, parciais_obrig, gaps_obrig = 0, 0, 0
        matches_desej, parciais_desej, gaps_desej = 0, 0, 0
        justificativa_formacao = "Pontuação estimada sem detalhamento de requisitos específicos."

    # 5. Penalização Dealbreaker / Inelegibilidade
    inelegivel = bool(alerta.get("inelegivel", False))
    possivel_inelegibilidade = bool(alerta.get("possivel_inelegibilidade", False))
    gap_critico = (len(reqs_obrig) > 0 and (gaps_obrig / len(reqs_obrig)) >= 0.6)

    teto_aplicado = False
    motivo_teto = None

    if inelegivel:
        teto_aplicado = True
        motivo_teto = alerta.get("motivo") or "Requisito eliminatório impeditivo identificado."
        score_final = min(round(score_bruto), TETO_DEALBREAKER)
    elif possivel_inelegibilidade:
        teto_aplicado = True
        motivo_teto = alerta.get("motivo") or "Possível incompatibilidade em critério eliminatório identificada."
        score_final = min(round(score_bruto), 65)
    elif gap_critico:
        teto_aplicado = True
        motivo_teto = f"Lacuna em {gaps_obrig} de {len(reqs_obrig)} requisitos mandatórios centrais."
        score_final = min(round(score_bruto), 60)
    else:
        score_final = round(score_bruto)

    memoria_calculo = {
        "score_final": score_final,
        "score_bruto": round(score_bruto, 1),
        "teto_dealbreaker_aplicado": teto_aplicado,
        "motivo_teto": motivo_teto,
        "formula": "Score = (Obrigatórios/60) + (Desejáveis/25) + (Formação/15)",
        "obrigatorios": {
            "pontos_obtidos": round(pontos_obrig, 1),
            "pontos_maximos": PESO_OBRIGATORIOS_MAX,
            "total_requisitos": len(reqs_obrig),
            "matches": matches_obrig,
            "parciais": parciais_obrig,
            "gaps": gaps_obrig,
        },
        "desejaveis": {
            "pontos_obtidos": round(pontos_desej, 1),
            "pontos_maximos": PESO_DESEJAVEIS_MAX,
            "total_requisitos": len(reqs_desej),
            "matches": matches_desej,
            "parciais": parciais_desej,
            "gaps": gaps_desej,
        },
        "formacao_contexto": {
            "pontos_obtidos": round(pontos_formacao, 1),
            "pontos_maximos": PESO_FORMACAO_MAX,
            "justificativa": justificativa_formacao,
        },
    }

    return score_final, memoria_calculo
