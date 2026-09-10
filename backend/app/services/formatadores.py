def formatar_salario_br(valor_str):
    """Auxiliar para formatar e padronizar textos de salario."""
    if not valor_str:
        return "A combinar"
    return valor_str.strip()
