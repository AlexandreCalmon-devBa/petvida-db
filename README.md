# PETVIDA - Sistema de Banco de Dados para Clínica Veterinária

Projeto de banco de dados relacional para gerenciamento de clínica veterinária. Inclui tabelas, views, functions, triggers e procedures com exemplo de uso.

## Estrutura do Projeto

```
petvida-db/
├── database/
│   ├── schema.sql           Criação das tabelas
│   ├── seed.sql             Dados iniciais de teste
│   ├── views.sql            Views (consultas nomeadas)
│   ├── functions.sql        Functions (cálculos e formatações)
│   ├── triggers.sql         Triggers (log de auditoria)
│   └── procedures.sql       Procedures (lógica de negócio)
├── test/
│   ├── test_schema.sh       Valida estrutura das tabelas
│   ├── test_seed.sh         Valida dados inseridos
│   ├── test_views.sh        Testa views
│   ├── test_functions_all.sh   Testa functions
│   ├── test_triggers_all.sh    Testa triggers
│   └── test_procedures.sh   Testa procedures
└── README.md
```

## Tabelas do Banco

| Tabela | Função |
|--------|--------|
| especies | Tipos de animais |
| veterinarios | Dados dos profissionais |
| tutores | Dados dos proprietários |
| animais | Cadastro de animais |
| consultas | Histórico de atendimentos |
| pagamentos | Registros de transações |
| log_auditoria | Rastreamento de alterações |

## Functions

| Função | Objetivo |
|--------|----------|
| fn_idade_animal(data_nascimento) | Retorna idade em "X anos Y meses" |
| fn_total_gasto_tutor(tutor_id) | Soma de consultas por tutor |
| fn_qtd_consultas_animal(animal_id) | Quantidade de consultas |
| fn_status_emoji(status) | Converte status para texto formatado |
| fn_classificar_valor(valor) | Classifica consulta por valor |

Exemplo de uso:

```sql
SELECT nome, fn_idade_animal(data_nascimento) AS idade
FROM animais;

SELECT nome, fn_total_gasto_tutor(id) AS total_gasto
FROM tutores;
```

## Views

| View | Descrição |
|------|-----------|
| view_animais_tutores | Animais com dados do tutor |
| view_consultas_completas | Consultas com detalhes completos |
| view_pagamentos_consultas | Pagamentos e dados da consulta |

## Triggers

| Trigger | Tipo | Função |
|---------|------|--------|
| trg_after_insert_consulta | AFTER INSERT | Log de inserção |
| trg_after_update_consulta_status | AFTER UPDATE | Log de mudança de status |
| trg_before_delete_consulta | BEFORE DELETE | Bloqueia exclusão se pago |
| trg_after_insert_animal | AFTER INSERT | Log de animal inserido |
| trg_before_update_pagamento | BEFORE UPDATE | Preenche data_pagamento |

## Procedures

| Procedure | Objetivo |
|-----------|----------|
| sp_agendar_consulta() | Agenda com validações |
| sp_confirmar_consulta() | Marca como realizada |
| sp_cancelar_consulta() | Cancela atendimento |
| sp_listar_consultas_vencidas() | Lista consultas em atraso |
| sp_relatorio_receitas() | Relatório financeiro |

## Instalação

Pré-requisitos:
- MySQL 8.0+ ou MariaDB 10.6+
- Acesso ao terminal
- Permissões para criar banco de dados

### Criar banco do zero

```bash
mysql -u root < database/schema.sql
mysql -u root petvida < database/seed.sql
mysql -u root petvida < database/views.sql
mysql -u root petvida < database/functions.sql
mysql -u root petvida < database/triggers.sql
mysql -u root petvida < database/procedures.sql
```

## Testes

Cada script de teste valida um componente específico. Execute na ordem desejada:

```bash
bash test/test_schema.sh           # Valida tabelas
bash test/test_seed.sh             # Valida dados
bash test/test_views.sh            # Valida views
bash test/test_functions_all.sh    # Valida functions
bash test/test_triggers_all.sh     # Valida triggers e auditoria
bash test/test_procedures.sh       # Valida procedures
```

### Executar todos os testes

```bash
for script in test/test_*.sh; do
    bash "$script"
    echo "---"
done
```

## Testes

Cada script de teste valida um componente específico. Execute na ordem desejada:

```bash
bash test/test_schema.sh           # Valida tabelas
bash test/test_seed.sh             # Valida dados
bash test/test_views.sh            # Valida views
bash test/test_functions_all.sh    # Valida functions
bash test/test_triggers_all.sh     # Valida triggers e auditoria
bash test/test_procedures.sh       # Valida procedures
```

Executar todos os testes:

```bash
for script in test/test_*.sh; do
    bash "$script"
    echo "---"
done
```

## Exemplos de Uso

Consultar idade dos animais:

```sql
SELECT nome, fn_idade_animal(data_nascimento) AS idade
FROM animais;
```

Total gasto por tutor:

```sql
SELECT t.nome, COUNT(c.id) AS consultas, fn_total_gasto_tutor(t.id) AS total
FROM tutores t
LEFT JOIN animais a ON t.id = a.tutor_id
LEFT JOIN consultas c ON a.id = c.animal_id
GROUP BY t.id;
```

Listar consultas com detalhes:

```sql
SELECT a.nome, v.nome, c.data_hora, c.status, c.valor
FROM consultas c
JOIN animais a ON c.animal_id = a.id
JOIN veterinarios v ON c.veterinario_id = v.id
LIMIT 10;
```

Agendar nova consulta:

```sql
CALL sp_agendar_consulta(1, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), 150.00);
```

Ver log de auditoria:

```sql
SELECT * FROM log_auditoria ORDER BY data_hora DESC LIMIT 20;
```

## Relacionamentos

Diagrama:

```
especies
   |
   +-- animais
         |
         +-- consultas -- pagamentos
         |
         +-- tutores

veterinarios -- consultas
```

- Um tutor pode ter vários animais
- Uma espécie pode ter vários animais
- Um animal pode ter várias consultas
- Uma consulta tem um pagamento associado
- Um veterinário realiza várias consultas

## Tecnologias

- MySQL 8.0+
- Shell Script (Bash)
- SQL

## Notas

- Scripts de teste reconfiguram o banco de dados
- Log de auditoria registra INSERT, UPDATE e DELETE
- Triggers impedem exclusão de consultas com pagamento confirmado
- Data de pagamento é preenchida automaticamente ao marcar como pago
