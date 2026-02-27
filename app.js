// 1. Configuración de Supabase
const SUPABASE_URL = 'https://afrfaeouzkjdkkqeozgq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcmZhZW91emtqZGtrcWVvemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTg1OTUsImV4cCI6MjA4Nzc5NDU5NX0.CRUaz7sNOuotsV3tVM5O2KvTerAT6uTXHaTy4yKKAdM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Referencias a elementos del DOM
const btnLogout = document.getElementById('btn-logout');
const userInfo = document.getElementById('user-info');
const seccionCliente = document.getElementById('seccion-cliente');
const authForms = document.getElementById('auth-forms');

// 3. Observador de estado de la sesión
_supabase.auth.onAuthStateChange((event, session) => {
    console.log("Evento de Auth:", event);
    if (session) {
        mostrarInterfazPrivada(session.user);
    } else {
        mostrarInterfazPublica();
    }
});

// 4. Funciones de Interfaz
function mostrarInterfazPrivada(user) {
    if (authForms) authForms.style.display = 'none'; 
    btnLogout.style.display = 'inline';
    userInfo.innerText = `Hola, ${user.email}`;
    
    // Mostrar secciones privadas
    seccionCliente.style.display = 'block';
    document.getElementById('seccion-perfil').style.display = 'block';
    
    // Cargar los datos desde la DB
    cargarPedidos(user.id);
    cargarPerfil(user.id);
}

function mostrarInterfazPublica() {
    if (authForms) authForms.style.display = 'block'; // Muestra registro/login
    btnLogout.style.display = 'none';
    userInfo.style.display = 'none';
    seccionCliente.style.display = 'none';
}

// 5. Lógica de Autenticación (Registro y Login)
async function handleSignUp() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const nombre = document.getElementById('reg-nombre').value;

    if (!email || !password || !nombre) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { nombre: nombre } // Se envía al trigger de la DB
        }
    });

    if (error) {
        alert("Error en registro: " + error.message);
    } else {
        alert("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
    }
}

// Función opcional para Login (si añades campos de login después)
async function handleLogin() {
    const email = prompt("Email:");
    const password = prompt("Contraseña:");
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
}

btnLogout.onclick = async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) console.error("Error al salir:", error.message);
};

// 6. Gestión de Datos (Pedidos)
async function cargarPedidos(userId) {
    const { data, error } = await _supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', userId)
        .order('fecha', { ascending: false });

    const contenedor = document.getElementById('historial-lista');
    
    if (error) {
        contenedor.innerHTML = '<p>Error al obtener historial.</p>';
        return;
    }
    
    if (data.length === 0) {
        contenedor.innerHTML = '<p>No tienes pedidos registrados aún.</p>';
    } else {
        contenedor.innerHTML = data.map(p => `
            <div style="border-bottom: 1px solid #ddd; padding: 15px 0; display: flex; justify-content: space-between;">
                <div>
                    <strong>Pedido #${p.id}</strong><br>
                    <small>${new Date(p.fecha).toLocaleDateString()}</small>
                </div>
                <div>
                    <span style="background: #eee; padding: 4px 8px; border-radius: 4px;">${p.estado}</span>
                </div>
                <div>
                    <strong>$${p.monto_total || 0}</strong>
                </div>
            </div>
        `).join('');
    }
}
// A. Cargar datos del perfil al iniciar sesión
async function cargarPerfil(userId) {
    const { data, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (data) {
        document.getElementById('perfil-nombre').value = data.nombre || '';
        document.getElementById('perfil-rut').value = data.rut || '';
        document.getElementById('perfil-direccion').value = data.direccion || '';
        document.getElementById('perfil-telefono').value = data.telefono || '';
    }
}

// B. Guardar o actualizar los datos
async function guardarPerfil() {
    const user = (await _supabase.auth.getUser()).data.user;
    if (!user) return;

    const updates = {
        id: user.id,
        nombre: document.getElementById('perfil-nombre').value,
        rut: document.getElementById('perfil-rut').value,
        direccion: document.getElementById('perfil-direccion').value,
        telefono: document.getElementById('perfil-telefono').value,
        updated_at: new Date()
    };

    const { error } = await _supabase.from('profiles').upsert(updates);

    if (error) {
        alert("Error al actualizar: " + error.message);
    } else {
        alert("¡Datos de perfil actualizados correctamente!");
    }
}
