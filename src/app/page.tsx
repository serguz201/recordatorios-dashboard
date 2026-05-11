'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardData, Registro, EstadoRegistro } from '@/types';
import styles from './page.module.css';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

// ── helpers ────────────────────────────────────────────────
function estadoLabel(e: EstadoRegistro) {
  return { ok: 'Al día', proximo: 'Próximo', critico: 'Crítico', vencido: 'Vencido', sin_fecha: 'Sin fecha' }[e];
}
function estadoClass(e: EstadoRegistro) {
  return { ok: styles.ok, proximo: styles.warn, critico: styles.danger, vencido: styles.danger, sin_fecha: styles.muted }[e];
}
function diasLabel(d: number | null) {
  if (d === null) return '—';
  if (d < 0) return `Venció hace ${Math.abs(d)}d`;
  if (d === 0) return '¡Hoy!';
  return `${d} días`;
}

// ── componente tarjeta urgente ─────────────────────────────
function TarjetaUrgente({ r }: { r: Registro }) {
  const dias = r.diasRestantes;
  const urgente = dias !== null && dias <= 7;
  return (
    <div className={`${styles.tarjeta} ${urgente ? styles.tarjetaUrgente : ''}`}>
      <div className={styles.tarjetaPrograma}>{r.programa}</div>
      <div className={styles.tarjetaNombre}>{r.nombre}</div>
      <div className={`${styles.tarjetaDias} ${estadoClass(r.estado)}`}>
        {diasLabel(r.diasRestantes)}
      </div>
      <div className={styles.tarjetaFecha}>{r.fechaVencimiento}</div>
    </div>
  );
}

// ── componente principal ────────────────────────────────────
export default function Home() {
  const [data, setData]         = useState<DashboardData | null>(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro]     = useState<EstadoRegistro | 'todos'>('todos');

  const cargar = useCallback(async () => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('TU_URL')) {
      setError('⚠️ Configura NEXT_PUBLIC_APPS_SCRIPT_URL en .env.local');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res  = await fetch(APPS_SCRIPT_URL);
      const json = await res.json() as DashboardData;
      setData(json);
      setError('');
    } catch {
      setError('No se pudo conectar con Apps Script. Verifica la URL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Filtrar registros
  const registrosFiltrados = (data?.registros ?? [])
    .filter(r => filtro === 'todos' || r.estado === filtro)
    .filter(r => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        (r.nombre ?? '').toLowerCase().includes(q) ||
        (r.programa ?? '').toLowerCase().includes(q) ||
        (r.correo ?? '').toLowerCase().includes(q) ||
        (r.fechaVencimiento ?? '').toLowerCase().includes(q) ||
        (r.notas ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const orden = ['vencido', 'critico', 'proximo', 'ok', 'sin_fecha'];
      return (
        orden.indexOf(a.estado) - orden.indexOf(b.estado) ||
        (a.diasRestantes ?? 999) - (b.diasRestantes ?? 999)
      );
    });

  // Contadores
  const contadores = {
    vencidos: data?.registros.filter(r => r.estado === 'vencido').length ?? 0,
    criticos: data?.registros.filter(r => r.estado === 'critico').length ?? 0,
    proximos: data?.registros.filter(r => r.estado === 'proximo').length ?? 0,
    ok:       data?.registros.filter(r => r.estado === 'ok').length      ?? 0,
  };

  // Más urgentes (top 4 no-ok)
  const masUrgentes = (data?.registros ?? [])
    .filter(r => r.estado !== 'ok' && r.estado !== 'sin_fecha' && r.diasRestantes !== null)
    .sort((a, b) => (a.diasRestantes ?? 999) - (b.diasRestantes ?? 999))
    .slice(0, 4);

  // ── render ────────────────────────────────────────────────
  if (loading) return (
    <div className={styles.centrado}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>Cargando datos…</p>
    </div>
  );

  if (error) return (
    <div className={styles.centrado}>
      <div className={styles.errorBox}>
        <span className={styles.errorIcon}>⚠</span>
        <p>{error}</p>
        <button className={styles.btnRecargar} onClick={cargar}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <main className={styles.main}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>🔔</div>
          <div>
            <h1 className={styles.titulo}>Recordatorios</h1>
            <p className={styles.subtitulo}>Sistema de vencimientos · Lima, Perú</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.metaInfo}>
            <span className={styles.metaLabel}>Última ejecución</span>
            <span className={styles.metaVal}>{data?.ultimaEjecucion ?? '—'}</span>
          </div>
          <div className={styles.metaInfo}>
            <span className={styles.metaLabel}>Hora de envío</span>
            <span className={styles.metaVal}>{data?.horaEnvio ?? '—'}:00</span>
          </div>
          <div className={styles.metaInfo}>
            <span className={styles.metaLabel}>Total registros</span>
            <span className={styles.metaVal}>{data?.total ?? 0}</span>
          </div>
          <button className={styles.btnRecargar} onClick={cargar}>↻ Recargar</button>
        </div>
      </header>

      {/* ── CONTADORES ─────────────────────────────────── */}
      <section className={styles.contadores}>
        {[
          { label: 'Vencidos', val: contadores.vencidos, cls: styles.danger, icon: '🔴', estado: 'vencido' as EstadoRegistro },
          { label: 'Críticos', val: contadores.criticos, cls: styles.danger, icon: '🟠', estado: 'critico' as EstadoRegistro },
          { label: 'Próximos', val: contadores.proximos, cls: styles.warn,   icon: '🟡', estado: 'proximo' as EstadoRegistro },
          { label: 'Al día',   val: contadores.ok,       cls: styles.ok,     icon: '🟢', estado: 'ok'      as EstadoRegistro },
        ].map(c => (
          <div
            key={c.label}
            className={`${styles.contador} ${filtro === c.estado ? styles.contadorActivo : ''}`}
            onClick={() => setFiltro(filtro === c.estado ? 'todos' : c.estado)}
          >
            <span className={styles.contadorIcon}>{c.icon}</span>
            <span className={`${styles.contadorNum} ${c.cls}`}>{c.val}</span>
            <span className={styles.contadorLabel}>{c.label}</span>
          </div>
        ))}
      </section>

      {/* ── MÁS URGENTES ───────────────────────────────── */}
      {masUrgentes.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>⚡ Más urgentes</h2>
          <div className={styles.tarjetas}>
            {masUrgentes.map(r => <TarjetaUrgente key={r.id} r={r} />)}
          </div>
        </section>
      )}

      {/* ── TABLA ──────────────────────────────────────── */}
      <section className={styles.seccion}>
        <div className={styles.tablaHeader}>
          <h2 className={styles.seccionTitulo}>📋 Todos los registros</h2>
          <div className={styles.controles}>
            <div className={styles.buscadorWrap}>
              <input
                className={styles.buscador}
                type="text"
                placeholder="Buscar nombre, programa, fecha, notas…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  className={styles.buscadorClear}
                  onClick={() => setBusqueda('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              className={styles.filtro}
              value={filtro}
              onChange={e => setFiltro(e.target.value as EstadoRegistro | 'todos')}
            >
              <option value="todos">Todos los estados</option>
              <option value="vencido">Vencidos</option>
              <option value="critico">Críticos</option>
              <option value="proximo">Próximos</option>
              <option value="ok">Al día</option>
            </select>
          </div>
        </div>

        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Programa</th>
                <th>Vencimiento</th>
                <th>Días</th>
                <th>Estado</th>
                <th>Avisos</th>
                <th>Notas</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.vacio}>Sin resultados</td>
                </tr>
              ) : registrosFiltrados.map(r => (
                <tr key={r.id} className={styles[`fila_${r.estado}`] ?? ''}>
                  <td className={styles.tdId}>{r.id}</td>
                  <td className={styles.tdNombre}>{r.nombre}</td>
                  <td className={styles.tdPrograma}>{r.programa}</td>
                  <td className={styles.tdFecha}>{r.fechaVencimiento}</td>
                  <td className={`${styles.tdDias} ${estadoClass(r.estado)}`}>
                    {diasLabel(r.diasRestantes)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${estadoClass(r.estado)}`}>
                      {estadoLabel(r.estado)}
                    </span>
                  </td>
                  <td className={styles.tdAvisos}>
                    <span title="Aviso 7 días" className={r.aviso7enviado ? styles.avisoOn : styles.avisoOff}>7d</span>
                    <span title="Aviso 5 días" className={r.aviso5enviado ? styles.avisoOn : styles.avisoOff}>5d</span>
                  </td>
                  <td className={styles.tdNotas}>{r.notas || '—'}</td>
                  <td className={styles.tdCorreo}>{r.correo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tablaFooter}>{registrosFiltrados.length} de {data?.total ?? 0} registros</p>
      </section>

    </main>
  );
}
