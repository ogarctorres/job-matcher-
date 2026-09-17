"""
Mecanismo Estruturado de Elegibilidade e Dealbreakers do Vektor.

Avalia determinísticamente critérios eliminatórios mandatórios:
1. Janela temporal de formatura / conclusão acadêmica.
2. Aderência de curso / área de formação.
3. Modalidade de trabalho (Remoto vs Presencial/Híbrido) e localização geográfica.

Estados suportados:
- ELIGIBLE: Candidato cumpre integralmente o critério.
- INELIGIBLE: Critério eliminatório violado (aciona teto de 50% no score).
- POSSIBLE_INELIGIBILITY: Incompatibilidade provável (aciona teto de 65% e alerta).
- UNKNOWN: Informação não declarada no currículo para confronto com a vaga.
"""

import re
import logging
from typing import Optional, Tuple, Dict, Any

logger = logging.getLogger(__name__)

MAPA_MESES = {
    "jan": 1, "janeiro": 1,
    "fev": 2, "fevereiro": 2,
    "mar": 3, "marco": 3, "março": 3,
    "abr": 4, "abril": 4,
    "mai": 5, "maio": 5,
    "jun": 6, "junho": 6,
    "jul": 7, "julho": 7,
    "ago": 8, "agosto": 8,
    "set": 9, "setembro": 9,
    "out": 10, "outubro": 10,
    "nov": 11, "novembro": 11,
    "dez": 12, "dezembro": 12,
}


def parse_data_formatura(texto: str) -> Optional[Tuple[int, int]]:
    """
    Converte uma representação textual de formatura em tupla (ano, mês).
    Exemplos:
    - 'Dez/2026' -> (2026, 12)
    - '12/2026' -> (2026, 12)
    - '2026' -> (2026, 12)
    - '2º semestre de 2025' -> (2025, 12)
    - '1º semestre de 2025' -> (2025, 6)
    """
    if not texto:
        return None

    t = texto.strip().lower()

    # 1. Semestre explícito: '1º semestre de 2026' ou '2º sem/2026'
    m_sem = re.search(r'([12])\s*[º°o]?\s*sem(?:estre)?[\s/de]+(20\d{2})', t)
    if m_sem:
        semestre = int(m_sem.group(1))
        ano = int(m_sem.group(2))
        mes = 6 if semestre == 1 else 12
        return (ano, mes)

    # 2. Mês por extenso/abreviado + ano: 'Dez/2026', 'dezembro de 2026', 'dez 2026'
    m_mes_ano = re.search(r'(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[\w]*[/\sde]+(20\d{2})', t)
    if m_mes_ano:
        mes_str = m_mes_ano.group(1)
        ano = int(m_mes_ano.group(2))
        mes = MAPA_MESES.get(mes_str, 12)
        return (ano, mes)

    # 3. Formato numérico: '12/2026' ou '06/2026'
    m_num = re.search(r'(0?[1-9]|1[0-2])[/-](20\d{2})', t)
    if m_num:
        mes = int(m_num.group(1))
        ano = int(m_num.group(2))
        return (ano, mes)

    # 4. Apenas ano com contexto de formatura: '2026'
    m_ano = re.search(r'(?:previs[aã]o|formatura|conclus[aã]o|concluindo)[\s\w:]*?(20\d{2})', t)
    if m_ano:
        ano = int(m_ano.group(1))
        return (ano, 12)

    return None


def extrair_formatura_candidato(texto_curriculo: str, dados_curriculo: dict = None) -> Optional[Tuple[int, int]]:
    """Extrai a previsão de formatura do candidato a partir de dados estruturados ou texto bruto."""
    # 1. Verifica se está em dados estruturados
    if dados_curriculo:
        for campo in ("formatura", "previsao_formatura", "conclusao", "educacao"):
            valor = dados_curriculo.get(campo)
            if isinstance(valor, str):
                data = parse_data_formatura(valor)
                if data:
                    return data

    # 2. Busca no texto do currículo
    if texto_curriculo:
        # Busca no trecho de educação
        linhas = texto_curriculo.splitlines()
        for linha in linhas:
            if any(termo in linha.lower() for termo in ["formatura", "previsão", "previsao", "conclusão", "conclusao", "término", "termino"]):
                data = parse_data_formatura(linha)
                if data:
                    return data

        # Busca ampla no texto
        return parse_data_formatura(texto_curriculo)

    return None


def extrair_janela_formatura_vaga(descricao_vaga: str) -> Optional[Dict[str, Any]]:
    """
    Identifica requisitos de janela de formatura na descrição da oportunidade.
    Retorna dicionário com tipo ('entre', 'ate', 'a_partir_de') e tuplas de datas.
    """
    if not descricao_vaga:
        return None

    texto = descricao_vaga.lower()

    # Padrão: 'Formatura entre Dez/2024 e Dez/2025' ou 'conclusão de 06/2025 a 12/2026'
    m_entre = re.search(
        r'(?:formatura|conclus[aã]o|previs[aã]o)[\s\w:]*?entre\s+([^\s,]+)\s+e\s+([^\s,;.]+)',
        texto
    )
    if not m_entre:
        m_entre = re.search(
            r'(?:formatura|conclus[aã]o|previs[aã]o)[\s\w:]*?de\s+([^\s,]+)\s+a(?:t[eé])?\s+([^\s,;.]+)',
            texto
        )

    if m_entre:
        inicio_str, fim_str = m_entre.group(1), m_entre.group(2)
        d_inicio = parse_data_formatura(inicio_str)
        d_fim = parse_data_formatura(fim_str)
        if d_inicio and d_fim:
            return {
                "tipo": "entre",
                "inicio": d_inicio,
                "fim": d_fim,
                "texto_original": f"Entre {inicio_str} e {fim_str}",
            }

    # Padrão: 'Formatura até Dez/2025' ou 'conclusão prevista até 2026'
    m_ate = re.search(r'(?:formatura|conclus[aã]o|previs[aã]o)[\s\w:]*?at[eé]\s+([^\s,;.]+)', texto)
    if m_ate:
        fim_str = m_ate.group(1)
        d_fim = parse_data_formatura(fim_str)
        if d_fim:
            return {
                "tipo": "ate",
                "inicio": (2020, 1),
                "fim": d_fim,
                "texto_original": f"Até {fim_str}",
            }

    # Padrão: 'Formatura a partir de 2026'
    m_partir = re.search(r'(?:formatura|conclus[aã]o|previs[aã]o)[\s\w:]*?a partir de\s+([^\s,;.]+)', texto)
    if m_partir:
        inicio_str = m_partir.group(1)
        d_inicio = parse_data_formatura(inicio_str)
        if d_inicio:
            return {
                "tipo": "a_partir_de",
                "inicio": d_inicio,
                "fim": (2035, 12),
                "texto_original": f"A partir de {inicio_str}",
            }

    return None


def avaliar_formatura(texto_curriculo: str, descricao_vaga: str, dados_curriculo: dict = None) -> Dict[str, Any]:
    """Avalia o critério temporal de formatura entre o candidato e a vaga."""
    data_candidato = extrair_formatura_candidato(texto_curriculo, dados_curriculo)
    janela_vaga = extrair_janela_formatura_vaga(descricao_vaga)

    if not janela_vaga:
        return {
            "status": "ELIGIBLE",
            "detalhe": "A vaga não exige janela estrita de formatura.",
            "candidato": f"{data_candidato[1]:02d}/{data_candidato[0]}" if data_candidato else "Não identificada",
            "exigido": "Livre",
        }

    if not data_candidato:
        return {
            "status": "UNKNOWN",
            "detalhe": f"A vaga requer formatura {janela_vaga['texto_original']}, mas a data de conclusão não foi informada no currículo.",
            "candidato": "Não informada",
            "exigido": janela_vaga["texto_original"],
        }

    inicio = janela_vaga["inicio"]
    fim = janela_vaga["fim"]

    if inicio <= data_candidato <= fim:
        return {
            "status": "ELIGIBLE",
            "detalhe": f"Formatura prevista ({data_candidato[1]:02d}/{data_candidato[0]}) está dentro da janela da vaga ({janela_vaga['texto_original']}).",
            "candidato": f"{data_candidato[1]:02d}/{data_candidato[0]}",
            "exigido": janela_vaga["texto_original"],
        }
    else:
        return {
            "status": "INELIGIBLE",
            "detalhe": f"Formatura prevista ({data_candidato[1]:02d}/{data_candidato[0]}) está FORA da janela obrigatória da vaga ({janela_vaga['texto_original']}).",
            "candidato": f"{data_candidato[1]:02d}/{data_candidato[0]}",
            "exigido": janela_vaga["texto_original"],
        }


def avaliar_curso(dados_curriculo: dict, texto_curriculo: str, descricao_vaga: str) -> Dict[str, Any]:
    """Avalia aderência do curso de graduação com requisitos mandatários da vaga."""
    texto_cv = f"{texto_curriculo or ''} {dados_curriculo.get('resumo', '') if dados_curriculo else ''}".lower()
    texto_vaga = (descricao_vaga or "").lower()

    # Cursos não-tecnológicos estritos que geram inelegibilidade se exigidos exclusivamente
    cursos_exclusivos_vaga = {
        "direito": ["direito", "jurídica", "juridica", "advocacia", "oab"],
        "psicologia": ["psicologia", "psicólogo", "psicologo", "crp"],
        "medicina": ["medicina", "médico", "crm"],
        "enfermagem": ["enfermagem", "enfermeiro", "coren"],
        "odontologia": ["odontologia", "dentista", "cro"],
        "veterinaria": ["medicina veterinária", "veterinario", "crmv"],
    }

    # Cursos de tecnologia comuns do candidato
    cursos_tech = [
        "ciência da computação", "ciencia da computacao", "engenharia de software",
        "sistemas de informação", "sistemas de informacao", "análise e desenvolvimento",
        "analise e desenvolvimento", "engenharia da computação", "engenharia da computacao",
        "ciência de dados", "banco de dados", "tecnologia da informação"
    ]
    candidato_eh_tech = any(c in texto_cv for c in cursos_tech)

    for area, termos in cursos_exclusivos_vaga.items():
        # Verifica se a vaga é exclusiva dessa área não-tech
        vaga_pede_area = any(
            re.search(r'\b(?:exclusivo|estritamente|obrigatório)\s+para\s+estudantes\s+de\s+' + re.escape(t), texto_vaga)
            or re.search(r'\bcursando\s+' + re.escape(t) + r'\b', texto_vaga)
            for t in termos
        )

        if vaga_pede_area and candidato_eh_tech:
            return {
                "status": "INELIGIBLE",
                "detalhe": f"A vaga exige graduação na área de {area.capitalize()}, enquanto o candidato cursa Tecnologia.",
                "candidato": "Tecnologia / Computação",
                "exigido": area.capitalize(),
            }

    return {
        "status": "ELIGIBLE",
        "detalhe": "Curso compatível com a área da oportunidade.",
        "candidato": "Área de Tecnologia",
        "exigido": "Tecnologia ou compatível",
    }


def avaliar_localizacao(dados_curriculo: dict, texto_curriculo: str, descricao_vaga: str) -> Dict[str, Any]:
    """Avalia modelo de trabalho (remoto vs presencial/híbrido) e compatibilidade geográfica."""
    texto_vaga = (descricao_vaga or "").lower()
    texto_cv = (texto_curriculo or "").lower()

    # Modalidade da vaga
    eh_remoto = any(termo in texto_vaga for termo in ["100% remoto", "totalmente remoto", "home office", "remoto"])
    eh_presencial_ou_hibrido = any(termo in texto_vaga for termo in ["presencial", "híbrido", "hibrido", "no escritório"])

    if eh_remoto and not eh_presencial_ou_hibrido:
        return {
            "status": "ELIGIBLE",
            "modalidade": "Remoto",
            "detalhe": "Vaga remota sem restrição geográfica.",
        }

    # Cidades principais e capitais para detecção
    cidades = {
        "são paulo": ("São Paulo", "SP"),
        "rio de janeiro": ("Rio de Janeiro", "RJ"),
        "belo horizonte": ("Belo Horizonte", "MG"),
        "curitiba": ("Curitiba", "PR"),
        "porto alegre": ("Porto Alegre", "RS"),
        "salvador": ("Salvador", "BA"),
        "recife": ("Recife", "PE"),
        "florianópolis": ("Florianópolis", "SC"),
        "fortaleza": ("Fortaleza", "CE"),
        "brasília": ("Brasília", "DF"),
    }

    cidade_vaga = None
    for nome, (cid, uf) in cidades.items():
        if nome in texto_vaga or uf.lower() in texto_vaga:
            cidade_vaga = (cid, uf)
            break

    cidade_candidato = None
    for nome, (cid, uf) in cidades.items():
        if nome in texto_cv:
            cidade_candidato = (cid, uf)
            break

    if eh_presencial_ou_hibrido and cidade_vaga and cidade_candidato:
        if cidade_vaga[1] != cidade_candidato[1]:  # Estados diferentes
            return {
                "status": "POSSIBLE_INELIGIBILITY",
                "modalidade": "Presencial/Híbrido",
                "detalhe": f"Vaga presencial/híbrida em {cidade_vaga[0]}-{cidade_vaga[1]}, enquanto o candidato reside em {cidade_candidato[0]}-{cidade_candidato[1]}.",
            }

    return {
        "status": "ELIGIBLE",
        "modalidade": "Presencial/Híbrido" if eh_presencial_ou_hibrido else "Livre",
        "detalhe": "Localização compatível ou sem restrições explícitas identificadas.",
    }


def avaliar_elegibilidade_completa(
    dados_curriculo: dict,
    texto_curriculo: str,
    descricao_vaga: str,
    alerta_ia: dict = None
) -> Dict[str, Any]:
    """
    Consolida todos os critérios eliminatórios (formatura, curso, presencialidade)
    e unifica com eventuais alertas sinalizados pela análise da IA.
    """
    criterio_formatura = avaliar_formatura(texto_curriculo, descricao_vaga, dados_curriculo)
    criterio_curso = avaliar_curso(dados_curriculo, texto_curriculo, descricao_vaga)
    criterio_local = avaliar_localizacao(dados_curriculo, texto_curriculo, descricao_vaga)

    criterios = {
        "formatura": criterio_formatura,
        "curso": criterio_curso,
        "localizacao": criterio_local,
    }

    # Determinação do status geral
    status_geral = "ELIGIBLE"
    motivos_rejeicao = []

    # 1. Verifica se há inelegibilidade confirmada
    if criterio_formatura["status"] == "INELIGIBLE":
        status_geral = "INELIGIBLE"
        motivos_rejeicao.append(criterio_formatura["detalhe"])

    if criterio_curso["status"] == "INELIGIBLE":
        status_geral = "INELIGIBLE"
        motivos_rejeicao.append(criterio_curso["detalhe"])

    # 2. Se a IA sinalizou inelegibilidade por outro motivo não coberto
    if alerta_ia and alerta_ia.get("inelegivel") and status_geral != "INELIGIBLE":
        status_geral = "INELIGIBLE"
        if alerta_ia.get("motivo"):
            motivos_rejeicao.append(alerta_ia["motivo"])

    # 3. Verifica se há possível inelegibilidade (ex: presencial em outro estado)
    if status_geral == "ELIGIBLE" and criterio_local["status"] == "POSSIBLE_INELIGIBILITY":
        status_geral = "POSSIBLE_INELIGIBILITY"
        motivos_rejeicao.append(criterio_local["detalhe"])

    # 4. Verifica status UNKNOWN
    if status_geral == "ELIGIBLE" and criterio_formatura["status"] == "UNKNOWN":
        status_geral = "UNKNOWN"
        motivos_rejeicao.append(criterio_formatura["detalhe"])

    if motivos_rejeicao:
        texto_unificado = " ".join(motivos_rejeicao)
        if "POSSÍVEL INELEGIBILIDADE" not in texto_unificado.upper() and status_geral in ("INELIGIBLE", "POSSIBLE_INELIGIBILITY"):
            motivo_final = f"⚠️ POSSÍVEL INELEGIBILIDADE: {texto_unificado}"
        else:
            motivo_final = texto_unificado
    else:
        motivo_final = "Nenhum critério eliminatório impeditivo identificado."

    return {
        "status_geral": status_geral,
        "inelegivel": status_geral == "INELIGIBLE",
        "possivel_inelegibilidade": status_geral == "POSSIBLE_INELIGIBILITY",
        "motivo": motivo_final,
        "criterios": criterios,
    }
