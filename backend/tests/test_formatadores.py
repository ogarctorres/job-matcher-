from app.services.formatadores import formatar_salario_br

def test_formatar_salario_vazio():
    assert formatar_salario_br("") == "A combinar"
    assert formatar_salario_br(None) == "A combinar"

def test_formatar_salario_com_valor():
    assert formatar_salario_br("R$ 1.800,00 ") == "R$ 1.800,00"
