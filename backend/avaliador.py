import ollama

from ia_utils import extrair_json, chamar_ia_com_retry


def avaliar_curriculo(texto_curriculo: str) -> dict:
    prompt = f"""
Você é um recrutador sênior de TI, com mais de 15 anos avaliando currículos
para vagas de ESTÁGIO em Desenvolvimento, Dados, Infraestrutura, Suporte ou
Segurança. O candidato é estudante — experiência técnica limitada é normal
e esperado.

REGRAS OBRIGATÓRIAS:
1. Use APENAS informações explícitas no currículo. Nunca invente
   tecnologias, experiências ou certificações ausentes.
2. Se uma tecnologia aparecer só citada, considere conhecimento básico. Se
   aparecer em projeto ou experiência profissional, considere prático.
3. A resposta deve ser SOMENTE um JSON válido, compatível com JSON.parse(),
   sem markdown, sem texto antes ou depois, sem vírgulas finais.

Avalie considerando: formação, projetos pessoais, tecnologias, linguagens,
frameworks, ferramentas, experiência profissional e clareza geral do
currículo — sempre no contexto de uma candidatura a ESTÁGIO, não vaga
plena ou sênior.

Responda exatamente neste formato:

Calibre a nota_geral desta forma:
- 0-20: currículo vazio ou sem nenhuma informação técnica relevante
- 21-40: menciona tecnologias, mas sem nenhum projeto ou experiência prática
- 41-60: tem 1-2 projetos ou experiências práticas relevantes
- 61-80: tem múltiplos projetos práticos, com tecnologias variadas e bem
  descritas
- 81-100: perfil excepcional para um candidato a estágio, com projetos
  avançados e clareza total na apresentação

IMPORTANTE: a nota_geral deve ser CONSISTENTE com os pontos_fortes que você
listar. Se você identificar múltiplos pontos fortes reais (projetos,
tecnologias aplicadas na prática), a nota não pode ser baixa. Currículos de
estudante com 1-2 projetos práticos bem descritos geralmente merecem nota
entre 55 e 75, não abaixo disso.

{{
    "nota_geral": 0,
    "pontos_fortes": ["ponto forte 1", "ponto forte 2"],
    "pontos_melhoria": ["sugestão 1", "sugestão 2"],
    "comentario_geral": "comentário curto sobre o currículo"
}}

Currículo:
{texto_curriculo}
"""

    def chamada():
        resposta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"num_predict": 1024, "num_ctx": 8192},
        )
        return extrair_json(resposta["message"]["content"])

    return chamar_ia_com_retry(chamada)