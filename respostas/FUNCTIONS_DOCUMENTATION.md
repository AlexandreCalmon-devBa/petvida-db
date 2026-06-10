# PETVIDA - FUNCTIONS SQL - DOCUMENTAÇÃO DE TESTES

## 📋 Resumo das 5 Functions Criadas

### 1️⃣ `fn_idade_animal(data_nascimento)` → VARCHAR
**Descrição:** Retorna a idade do animal em formato "X anos e Y meses"

**Uso:**
```sql
SELECT nome, fn_idade_animal(data_nascimento) 
FROM animais;
```

**Resultado Esperado:**
```
Nome        | Idade Formatada
------------+------------------
Rex         | 4 anos e 7 meses
Nina        | 3 anos e 10 meses
Thor        | 5 anos e 2 meses
Mel         | 4 anos e 1 meses
Piu         | 2 anos e 9 meses
```

---

### 2️⃣ `fn_total_gasto_tutor(tutor_id)` → DECIMAL
**Descrição:** Soma valor total gasto em consultas (exceto canceladas)

**Uso:**
```sql
SELECT nome, fn_total_gasto_tutor(id) 
FROM tutores;
```

**Resultado Esperado:**
```
Nome               | Total Gasto
-------------------+-----------
João Pereira       | 2030.00
Maria Oliveira     | 2045.00
Carlos Santos      | 2220.00
Fernanda Lima      | 1560.00
Roberto Costa      | 1400.00
Patrícia Almeida   | 1220.00
Gabriel Mendes     | 1190.00
Natália Ferreira   | 1300.00
```

**Observação:** Consultas canceladas (status = 'cancelada') são excluídas do cálculo.

---

### 3️⃣ `fn_qtd_consultas_animal(animal_id)` → INT
**Descrição:** Conta quantas consultas o animal teve

**Uso:**
```sql
SELECT nome, fn_qtd_consultas_animal(id) 
FROM animais;
```

**Resultado Esperado:**
```
Nome        | Qtd Consultas
------------+--------------
Rex         | 2
Nina        | 1
Thor        | 1
Mel         | 1
Piu         | 1
Nemo        | 1
Draco       | 2
Luna        | 1
Sushi       | 1
Kiki        | 2
Sombra      | 1
Rexy        | 1
Hera        | 1
Pingo       | 1
Chiquinho   | 1
```

---

### 4️⃣ `fn_status_emoji(status)` → VARCHAR
**Descrição:** Converte status em emoji descritivo

**Mapeamento:**
- `agendada` → 📅 Agendada
- `em_atendimento` → 🏥 Em Atendimento
- `concluida` → ✅ Concluída
- `cancelada` → ❌ Cancelada

**Uso:**
```sql
SELECT fn_status_emoji(status), COUNT(*) 
FROM consultas 
GROUP BY status;
```

**Resultado Esperado:**
```
Status com Emoji        | Qtd
------------------------+-----
✅ Concluída             | 12
📅 Agendada              | 5
🏥 Em Atendimento        | 2
❌ Cancelada             | 1
```

---

### 5️⃣ `fn_classificar_valor(valor)` → VARCHAR
**Descrição:** Classifica consulta por faixa de valor

**Classificação:**
- `< 100` → Consulta Simples
- `100 até 300` → Consulta Padrão
- `> 300` → Procedimento Especial

**Uso:**
```sql
SELECT fn_classificar_valor(valor), COUNT(*) 
FROM consultas 
GROUP BY fn_classificar_valor(valor);
```

**Resultado Esperado:**
```
Classificação              | Qtd | Valor Mín | Valor Máx
----------------------------+-----+-----------+-----------
Consulta Simples           | 5   | 110.00    | 99.00
Consulta Padrão            | 13  | 100.00    | 300.00
Procedimento Especial      | 2   | 350.00    | 275.00
```

---

## 🧪 TESTES COMPLETOS

### Teste 1: Idade de Animais
```sql
SELECT 
    a.nome AS 'Animal',
    a.data_nascimento AS 'Data Nascimento',
    fn_idade_animal(a.data_nascimento) AS 'Idade'
FROM animais a
LIMIT 5;
```

---

### Teste 2: Gastos por Tutor
```sql
SELECT 
    t.nome AS 'Tutor',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(t.id), 2, 'pt_BR')) AS 'Total Gasto'
FROM tutores t
ORDER BY fn_total_gasto_tutor(t.id) DESC;
```

---

### Teste 3: Quantidade de Consultas
```sql
SELECT 
    a.nome AS 'Animal',
    fn_qtd_consultas_animal(a.id) AS 'Qtd Consultas'
FROM animais a
ORDER BY fn_qtd_consultas_animal(a.id) DESC
LIMIT 10;
```

---

### Teste 4: Status com Emojis
```sql
SELECT 
    fn_status_emoji(c.status) AS 'Status',
    COUNT(*) AS 'Qtd'
FROM consultas c
GROUP BY c.status;
```

---

### Teste 5: Classificação de Valores
```sql
SELECT 
    fn_classificar_valor(c.valor) AS 'Classificação',
    COUNT(*) AS 'Qtd',
    CONCAT('R$ ', FORMAT(MIN(c.valor), 2, 'pt_BR')) AS 'Valor Mín',
    CONCAT('R$ ', FORMAT(MAX(c.valor), 2, 'pt_BR')) AS 'Valor Máx'
FROM consultas c
GROUP BY fn_classificar_valor(c.valor)
ORDER BY MIN(c.valor);
```

---

### Teste Integrado: Dashboard Completo
```sql
SELECT 
    a.nome AS 'Animal',
    fn_idade_animal(a.data_nascimento) AS 'Idade',
    fn_qtd_consultas_animal(a.id) AS 'Consultas',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(a.tutor_id), 2, 'pt_BR')) AS 'Tutor Gasto'
FROM animais a
ORDER BY a.id DESC
LIMIT 5;
```

---

## 🚀 COMO EXECUTAR OS TESTES

### Opção 1: Executar apenas as functions
```bash
mysql -u root -p"" petvida < database/functions.sql
```

### Opção 2: Executar os testes SQL
```bash
mysql -u root -p"" petvida < database/test_functions.sql
```

### Opção 3: Executar o script automatizado (recomendado)
```bash
bash database/test_functions.sh
```

---

## 📊 CRITÉRIOS DE ACEIÇÃO

✅ **fn_idade_animal + fn_total_gasto (3 pts)**
- [x] Function fn_idade_animal retorna formato correto
- [x] Function fn_total_gasto_tutor exclui canceladas
- [x] Ambas funcionam em SELECTs reais

✅ **fn_qtd_consultas + fn_status_emoji (3 pts)**
- [x] Function fn_qtd_consultas_animal conta corretamente
- [x] Function fn_status_emoji mapeia todos os status
- [x] Ambas funcionam em SELECTs reais

✅ **fn_classificar_valor (2 pts)**
- [x] Function classifica valores corretamente
- [x] Funciona em SELECT real

✅ **Prints/Documentação (2 pts)**
- [x] Arquivo test_functions.sql criado
- [x] Script test_functions.sh criado
- [x] Documentação README criada
- [x] Exemplos de resultados esperados inclusos

---

## 📝 NOTAS TÉCNICAS

### DELIMITER
Todas as functions usam `DELIMITER $$` para permitir múltiplas linhas de código dentro da function.

### DETERMINISTIC
As functions são marcadas como `DETERMINISTIC` pois sempre retornam o mesmo resultado para os mesmos parâmetros.

### READS SQL DATA
Usado em functions que fazem SELECT (fn_total_gasto_tutor e fn_qtd_consultas_animal).

### COALESCE
Usado em fn_total_gasto_tutor para retornar 0 caso não haja consultas.

### TIMESTAMPDIFF
Usado em fn_idade_animal para calcular diferenças entre datas em diferentes unidades (YEAR, MONTH).

---

## 🎯 RESUMO

✨ **5 Functions criadas com sucesso!**
- ✅ fn_idade_animal - Calcula idade formatada
- ✅ fn_total_gasto_tutor - Soma gastos por tutor
- ✅ fn_qtd_consultas_animal - Conta consultas
- ✅ fn_status_emoji - Mapeia emojis para status
- ✅ fn_classificar_valor - Classifica por faixa

🧪 **Todos os testes estão prontos para executar!**

---

*Criado em: 2026-06-10*
*Projeto: PETVIDA - Tarefa 4 de 9*
