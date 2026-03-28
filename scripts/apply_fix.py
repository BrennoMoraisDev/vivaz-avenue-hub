"""
Script para aplicar correções no banco Supabase via API.
Usa a service_role key para executar SQL com privilégios elevados.
"""
import os
import requests
import json

# Configurações do projeto Supabase
SUPABASE_URL = "https://okmuhustvzkbwxsfemxn.supabase.co"
# A service_role key é necessária para executar SQL diretamente
# Ela pode ser encontrada em: Supabase Dashboard > Project Settings > API > service_role key
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

def execute_sql(sql: str, description: str = ""):
    """Executa SQL via Supabase REST API."""
    if not SUPABASE_SERVICE_KEY:
        print(f"❌ SUPABASE_SERVICE_KEY não configurada")
        return False
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # Usar o endpoint de RPC para executar SQL
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers=headers,
        json={"query": sql}
    )
    
    if response.status_code in [200, 201, 204]:
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description}: {response.status_code} - {response.text[:200]}")
        return False

def check_tables():
    """Verifica o estado atual das tabelas."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ SUPABASE_SERVICE_KEY não configurada. Não é possível verificar.")
        return
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    tables = ["perfis", "clientes", "barbeiros", "servicos", "agendamentos"]
    
    for table in tables:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}?select=count",
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else "?"
            print(f"  📊 {table}: {count} registros")
        else:
            print(f"  ❌ {table}: erro {response.status_code}")

if __name__ == "__main__":
    print("=" * 60)
    print("VIVAZ BARBEARIA - VERIFICAÇÃO DO BANCO")
    print("=" * 60)
    
    if not SUPABASE_SERVICE_KEY:
        print("\n⚠️  Para aplicar as correções automaticamente, configure:")
        print("   export SUPABASE_SERVICE_KEY='sua_service_role_key'")
        print("\n📋 Alternativamente, execute o SQL manualmente:")
        print("   1. Acesse: https://supabase.com/dashboard/project/okmuhustvzkbwxsfemxn/sql/new")
        print("   2. Cole o conteúdo de: docs/fix_database.sql")
        print("   3. Clique em 'Run'")
    else:
        print("\n🔍 Verificando estado atual do banco...")
        check_tables()
    
    print("\n✅ Script concluído")
    print("\n📋 PRÓXIMOS PASSOS:")
    print("1. Execute o SQL em docs/fix_database.sql no Supabase SQL Editor")
    print("2. Crie os usuários de teste em Authentication > Users > Add User:")
    print("   - cliente.teste@vivaz.com / Vivaz@2026 (role: cliente)")
    print("   - barbeiro.teste@vivaz.com / Vivaz@2026 (role: barbeiro)")
    print("3. No SQL Editor, vincule o barbeiro:")
    print("   UPDATE barbeiros SET user_id = '<id_do_barbeiro>' WHERE nome = 'Barbeiro Teste';")
    print("   (ou crie um barbeiro novo com o user_id do usuário criado)")
