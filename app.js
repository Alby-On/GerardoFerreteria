// Configuración (Reemplaza con tus credenciales de Supabase)
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = 'tu-anon-key-aqui';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const userInfo = document.getElementById('user-info');
const seccionCliente = document.getElementById('seccion-cliente');

// 1. Detectar cambios en la sesión
_supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        mostrarInterfazPrivada(session.user);
    } else {
        mostrarInterfazPublica();
    }
});

function mostrarInterfazPrivada(user) {
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline';
    userInfo.style.display = 'inline';
    userInfo.innerText = `Bienvenido: ${user.email}`;
    seccionCliente.style.display = 'block';
    cargarPedidos(user.id);
}

function mostrarInterfazPublica() {
    btnLogin.style.display = 'inline';
    btnLogout.style.display = 'none';
    userInfo.style.display = 'none';
    seccionCliente.style.display = 'none';
}

// 2. Función para cargar pedidos desde Supabase
async function cargarPedidos(userId) {
    const { data, error } = await _supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', userId);

    const contenedor = document.getElementById('historial-lista');
    if (error) {
        contenedor.innerHTML = '<p>Error al cargar pedidos.</p>';
        return;
    }
    
    if (data.length === 0) {
        contenedor.innerHTML = '<p>Aún no tienes pedidos.</p>';
    } else {
        contenedor.innerHTML = data.map(p => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <strong>Pedido #${p.id}</strong> - Estado: <span>${p.estado}</span> - Total: $${p.monto}
            </div>
        `).join('');
    }
}

// Evento Login (aquí podrías abrir un modal o redirigir)
btnLogin.onclick = async () => {
    // Para simplificar, usamos un login rápido (deberás configurar el método en Supabase)
    const email = prompt("Introduce tu email:");
    const password = prompt("Introduce tu contraseña:");
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
};

btnLogout.onclick = async () => {
    await _supabase.auth.signOut();
};
async function handleSignUp() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const nombre = document.getElementById('reg-nombre').value;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                nombre: nombre // Esto lo recibe el trigger de arriba
            }
        }
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Registro exitoso! Revisa tu email para confirmar.");
    }
}
