"""Rotas do módulo de Desafios Técnicos & Treino LeetCode para estudantes."""

import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.core.ia_client import chamar_ia

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/desafios", tags=["desafios"])


# Banco de desafios curados de alto nível para estágio e início de carreira
TRILHAS_PADRAO = {
    "python": [
        {
            "id": "py-1",
            "titulo": "Agrupamento de Vendas por Categoria",
            "dificuldade": "Iniciante",
            "categoria": "Python Backend",
            "enunciado": "Você recebeu uma lista de dicionários representando vendas. Crie uma função 'totalizar_vendas(transacoes)' que retorne um dicionário contendo o valor total acumulado por cada categoria.",
            "codigo_inicial": "def totalizar_vendas(transacoes):\n    # Seu código aqui\n    pass\n",
            "casos_teste": [
                {"entrada": "[{'categoria': 'eletronicos', 'valor': 100}, {'categoria': 'eletronicos', 'valor': 50}]", "saida_esperada": "{'eletronicos': 150}"}
            ],
            "dicas": [
                "Utilize um dicionário comum ou um 'defaultdict(float)' do módulo collections.",
                "Percorra cada transação somando 'valor' na chave 'categoria'."
            ],
            "solucao_referencia": "def totalizar_vendas(transacoes):\n    totais = {}\n    for item in transacoes:\n        cat = item['categoria']\n        totais[cat] = totais.get(cat, 0) + item['valor']\n    return totais"
        },
        {
            "id": "py-2",
            "titulo": "Filtro e Sanitização de Usuários",
            "dificuldade": "Iniciante",
            "categoria": "Python Backend",
            "enunciado": "Crie uma função 'filtrar_usuarios_ativos(usuarios)' que receba uma lista de usuários e retorne apenas os emails em minúsculas daqueles que possuem 'ativo == True'.",
            "codigo_inicial": "def filtrar_usuarios_ativos(usuarios):\n    # Seu código aqui\n    pass\n",
            "casos_teste": [
                {"entrada": "[{'email': 'User@Test.com', 'ativo': True}, {'email': 'b@b.com', 'ativo': False}]", "saida_esperada": "['user@test.com']"}
            ],
            "dicas": [
                "List comprehensions em Python deixam a solução limpa e idiomática.",
                "Lembre-se do método .lower() para padronizar os emails."
            ],
            "solucao_referencia": "def filtrar_usuarios_ativos(usuarios):\n    return [u['email'].lower() for u in usuarios if u.get('ativo')]"
        }
    ],
    "sql": [
        {
            "id": "sql-1",
            "titulo": "Top Departamentos por Gasto Salarial",
            "dificuldade": "Intermediário",
            "categoria": "SQL & Bancos de Dados",
            "enunciado": "Dada a tabela 'funcionarios' (id, nome, departamento, salario), escreva uma consulta SQL que retorne o nome do departamento e a soma dos salários, filtrando apenas departamentos com gasto total superior a R$ 20.000, ordenados do maior para o menor gasto.",
            "codigo_inicial": "-- Escreva sua consulta SQL abaixo:\nSELECT \nFROM funcionarios\n",
            "casos_teste": [
                {"entrada": "Tabela funcionarios com 10 registros", "saida_esperada": "departamento | total_salario"}
            ],
            "dicas": [
                "Utilize GROUP BY departamento.",
                "Filtros sobre agregações (SUM) exigem a cláusula HAVING, não WHERE.",
                "Finalize com ORDER BY total_salario DESC."
            ],
            "solucao_referencia": "SELECT departamento, SUM(salario) AS total_salario\nFROM funcionarios\nGROUP BY departamento\nHAVING SUM(salario) > 20000\nORDER BY total_salario DESC;"
        }
    ],
    "redes": [
        {
            "id": "redes-1",
            "titulo": "Validador de Formato de Endereço IPv4",
            "dificuldade": "Iniciante",
            "categoria": "Redes & Infra",
            "enunciado": "Crie uma função 'validar_ipv4(ip_str)' que receba uma string e retorne True se for um IPv4 válido (4 octetos separados por ponto, cada um entre 0 e 255 sem zeros à esquerda inválidos), e False caso contrário.",
            "codigo_inicial": "def validar_ipv4(ip_str):\n    # Seu código aqui\n    pass\n",
            "casos_teste": [
                {"entrada": "'192.168.1.1'", "saida_esperada": "True"},
                {"entrada": "'256.0.0.1'", "saida_esperada": "False"}
            ],
            "dicas": [
                "Faça um .split('.') e verifique se a lista possui exatamente 4 elementos.",
                "Valide se todos os elementos são dígitos antes de converter para int.",
                "Garanta que o valor numérico esteja no intervalo de 0 a 255."
            ],
            "solucao_referencia": "def validar_ipv4(ip_str):\n    partes = ip_str.split('.')\n    if len(partes) != 4:\n        return False\n    for p in partes:\n        if not p.isdigit() or (len(p) > 1 and p.startswith('0')):\n            return False\n        if not (0 <= int(p) <= 255):\n            return False\n    return True"
        }
    ]
}


class GerarDesafiosRequest(BaseModel):
    stack: Optional[str] = Field(None, max_length=200, description="Tecnologias solicitadas, ex: 'Python, SQL'")
    titulo_vaga: Optional[str] = Field(None, max_length=200, description="Título da vaga alvo")
    descricao_vaga: Optional[str] = Field(None, max_length=15000, description="Texto da vaga para extrair contexto")


@router.get("/trilhas")
def listar_trilhas_disponiveis():
    """Retorna as trilhas temáticas de desafios técnicos práticos disponíveis para estudo."""
    return {
        "trilhas": [
            {"id": "python", "nome": "Python para Backend", "icone": "🐍", "total": len(TRILHAS_PADRAO["python"])},
            {"id": "sql", "nome": "SQL & Bancos de Dados", "icone": "🗄️", "total": len(TRILHAS_PADRAO["sql"])},
            {"id": "redes", "nome": "Redes & Infraestrutura", "icone": "🌐", "total": len(TRILHAS_PADRAO["redes"])},
        ],
        "desafios_por_trilha": TRILHAS_PADRAO,
    }


@router.post("/gerar")
def gerar_desafios_customizados(payload: GerarDesafiosRequest):
    """
    Gera desafios técnicos estilo LeetCode / HackerRank personalizados para a vaga selecionada.
    """
    stack_texto = (payload.stack or payload.titulo_vaga or "").lower()

    desafios_selecionados = []

    # Prioriza desafios das tecnologias detectadas
    if "sql" in stack_texto or "banco" in stack_texto or "dados" in stack_texto:
        desafios_selecionados.extend(TRILHAS_PADRAO["sql"])
    if "python" in stack_texto or "backend" in stack_texto or "fastapi" in stack_texto or "django" in stack_texto:
        desafios_selecionados.extend(TRILHAS_PADRAO["python"])
    if "rede" in stack_texto or "infra" in stack_texto or "seguranca" in stack_texto or "cisco" in stack_texto:
        desafios_selecionados.extend(TRILHAS_PADRAO["redes"])

    # Se não houver correspondência direta, mescla exercícios fundamentais
    if not desafios_selecionados:
        desafios_selecionados = (
            TRILHAS_PADRAO["python"][:1] + TRILHAS_PADRAO["sql"][:1] + TRILHAS_PADRAO["redes"][:1]
        )

    return {
        "contexto_vaga": payload.titulo_vaga or "Treino Técnico Geral",
        "total_desafios": len(desafios_selecionados),
        "desafios": desafios_selecionados,
    }
