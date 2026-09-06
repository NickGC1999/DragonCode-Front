import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutJuegoComponent } from '../layout-juego/layout-juego.component';
import { TarjetaConfig } from '../baraja-tarjetas/baraja-tarjetas.component';
import {
  BanderasEstrategiaTaladro,
  FaseTaladro
} from '../motor-v2/evaluador-nivel';
import { MotorEjecucionService } from '../motor-v2/motor-ejecucion.service';
import {
  AulasService,
  ParametrosEvaluacion,
  RetoPersonalizadoResponse
} from '../services/aulas.service';
import { LoaderService } from '../services/loader.service';
import { ProgresoService } from '../services/progreso.service';
import nivel2Data from '../../assets/data/aventuraniveles/nivel-2.json';

type TipoEventoTaladro = 'temperatura' | 'peso' | 'carbon';
type EstadoTaladro =
  | 'detenido'
  | 'perforando'
  | 'liberando-vapor'
  | 'empacando'
  | 'recargando'
  | 'explosion'
  | 'banda-rota'
  | 'sin-combustible'
  | 'estable'
  | 'ahogo'
  | 'descompuesto';

interface TarjetaTaladro {
  codigo: string;
  etiqueta: string;
  tono: 'verde' | 'dorado' | 'azul' | 'violeta';
  tipo: 'accion' | 'condicion';
  protocolo: TipoEventoTaladro;
}

interface FaseNivelDos {
  numero: number;
  titulo: string;
  concepto: string;
  objetivo: string;
  pista: string;
  evento: string;
  tarjetas: TarjetaTaladro[];
}

export interface ProtocoloAprendido {
  numero: number;
  nombre: string;
  condicion: string;
  accion: string;
  condicionCodigo: string;
  accionCodigo: string;
}

@Component({
  selector: 'app-nivel-dos-prototipo',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutJuegoComponent],
  templateUrl: './nivel-dos-prototipo.component.html',
  styleUrl: './nivel-dos-prototipo.component.scss'
})
export class NivelDosPrototipoComponent implements OnInit, OnDestroy {
  readonly protocolosAprendidos: ProtocoloAprendido[] = nivel2Data.protocolosAprendidos as ProtocoloAprendido[];
  fases: FaseNivelDos[] = nivel2Data.fases as unknown as FaseNivelDos[];

  @ViewChild(LayoutJuegoComponent) layoutJuego!: LayoutJuegoComponent;
  pasoAndamiaje = 0;
  antiCopiaActivo = false;
  ayudaUsada = false;

  private readonly tonoColores: Record<string, { boton: string; consola: string }> = {
    azul:    { boton: '#174bd4', consola: '#82B1FF' },
    verde:   { boton: '#288650', consola: '#A5D6A7' },
    dorado:  { boton: '#df4517', consola: '#FFAB91' },
    violeta: { boton: '#8e1ba4', consola: '#CE93D8' }
  };

  inventarioNivel = {
    libro: { activo: true },
    clarividencia: { activo: false, consumida: false },
    vida: { activo: true, consumida: false },
    tiempo: { activo: false, consumida: false }
  };

  faseActualIndice = 0;
  codigoUsuario = '';
  temperatura = 0;
  pesoCristales = 0;
  combustible = 100;
  intentosEjecucion = 0;
  erroresAcumulados = 0;
  tiempoSegundos = 0;
  ejecutando = false;
  faseCompletada = false;
  nivelCompletado = false;
  falloFase = false;
  gameOver = false;
  pistaVisible = false;
  ayudaVisible = false;
  estadoTaladro: EstadoTaladro = 'detenido';
  errores: string[] = [];
  bitacora = 'Motor detenido. Construye la estrategia dentro del evento.';
  estrellas = 0;
  calificacion = 0;
  pestanaInventario: 'acciones' | 'objetos' = 'acciones';
  cargandoContextoAula = false;
  guardandoProgreso = false;
  progresoGuardado = false;
  mensajeSincronizacion = '';
  
  falloFase1AndamiajeConfig = { operador: '', valor: 0, accion: '', tipoFallo: '' };
  get ejecutandoComandos(): boolean { return this.ejecutando; }

  get configTarjetasTaladro(): TarjetaConfig[] {
    if (this.faseActual.numero === 1) {
      let andamiaje: any[] = [];
      switch (this.pasoAndamiaje) {
        case 0:
          andamiaje = [{ etiqueta: "Control temperatura", codigo: "si(taladro.temperatura ▯ ▯) {\n    ▯\n  }", tono: "dorado" }];
          break;
        case 1:
          andamiaje = [{ etiqueta: ">", codigo: ">", tono: "violeta" }, { etiqueta: "<", codigo: "<", tono: "violeta" }];
          break;
        case 2:
          andamiaje = [0, 50, 75, 100, 150].map(v => ({ etiqueta: v.toString(), codigo: v.toString(), tono: "azul" }));
          break;
        case 3:
          andamiaje = [
            { etiqueta: "Liberar vapor", codigo: "taladro.liberarVapor();", tono: "verde" },
            { etiqueta: "Apagar motor", codigo: "taladro.apagarMotor();", tono: "verde" },
            { etiqueta: "Extraer carbón", codigo: "taladro.extraerCarbon();", tono: "verde" }
          ];
          break;
      }
      return andamiaje.map(t => {
        const colores = this.tonoColores[t.tono] || this.tonoColores['azul'];
        return { nombre: t.etiqueta, accion: t.codigo, colorBoton: colores.boton, colorConsola: colores.consola };
      });
    }
    return this.faseActual.tarjetas.map(t => {
      const colores = this.tonoColores[(t as any).tono] || this.tonoColores['azul'];
      return { nombre: (t as any).etiqueta, accion: (t as any).codigo, colorBoton: colores.boton, colorConsola: colores.consola };
    });
  }

  manejarToggleDraco(estado: boolean) { this.ayudaVisible = estado; }
  manejarUsoPocion(pocion: string) { if (pocion === 'libro') this.ayudaVisible = !this.ayudaVisible; }
  registrarAyudaUsada() { this.ayudaUsada = true; }

  manejarUsoTarjeta(tarjeta: TarjetaConfig): void {
    if (this.faseActual.numero !== 1) { this.ayudaUsada = true; return; }
    if (this.pasoAndamiaje === 0) {
      const lineas = this.layoutJuego.lineasCodigo;
      const idx = lineas.findIndex(l => l.esPlaceholder);
      if (idx !== -1) {
        const nuevasLineas = tarjeta.accion.split('\n').map(l => ({ texto: '    ' + l, color: '#DCDCAA', tieneError: false }));
        lineas.splice(idx, 1, ...nuevasLineas);
      }
      this.pasoAndamiaje++;
    } else if (this.pasoAndamiaje >= 1 && this.pasoAndamiaje <= 3) {
      const lineas = this.layoutJuego.lineasCodigo;
      for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].texto.includes('▯')) {
           lineas[i].texto = lineas[i].texto.replace('▯', tarjeta.accion);
           if (this.pasoAndamiaje === 3 && tarjeta.accion.includes('taladro.')) lineas[i].color = '#569CD6';
           break;
        }
      }
      this.pasoAndamiaje++;
    }
  }

  ngAfterViewInit(): void { setTimeout(() => this.inicializarConsolaTexto(), 0); }

  private inicializarConsolaTexto(): void {
    if (this.layoutJuego) {
      this.layoutJuego.lineasCodigo = [
        { texto: this.faseActual.evento, color: '#C586C0', tieneError: false, fija: true },
        { texto: '    // Inserta tu código aquí', color: '#6b7280', tieneError: false, esPlaceholder: true },
        { texto: '}', color: '#C586C0', tieneError: false, fija: true }
      ];
      if (this.layoutJuego.consola) {
        this.layoutJuego.consola.lineas = this.layoutJuego.lineasCodigo;
        this.layoutJuego.consola.lineaActivaIndex = 1;
      }
    }
    if (this.faseActual.numero === 1) this.pasoAndamiaje = 0;
  }

  restaurarPlantilla(): void {
    if (this.ejecutando || this.faseCompletada || this.falloFase) return;
    this.inicializarConsolaTexto();
    this.errores = [];
  }

  borrarUltimaLineaPlantilla(): void {
    if (this.ejecutando || this.faseCompletada || this.falloFase || !this.layoutJuego) return;
    if (this.faseActual.numero === 1) { this.inicializarConsolaTexto(); return; }

    const lineas = this.layoutJuego.lineasCodigo;
    const idxLibre = lineas.map((l, i) => ({l, i})).reverse().find(x => !x.l.fija && !x.l.esPlaceholder)?.i;
    if (idxLibre !== undefined) {
      lineas.splice(idxLibre, 1);
      if (!lineas.some(l => !l.fija && !l.esPlaceholder)) {
         const indexCierre = lineas.findIndex(l => l.texto.trim() === '}' && l.fija);
         lineas.splice(indexCierre !== -1 ? indexCierre : lineas.length, 0, { texto: '    // Inserta tu código aquí', color: '#6b7280', tieneError: false, esPlaceholder: true });
      }
    }
    this.errores = [];
  }

  estrategias: BanderasEstrategiaTaladro = this.banderasVacias();
  eventosResueltos: Record<TipoEventoTaladro, boolean> = {
    temperatura: false,
    peso: false,
    carbon: false
  };

  private tiempoInicioMs = 0;
  private temporizador?: ReturnType<typeof setInterval>;
  private gameLoop?: ReturnType<typeof setInterval>;
  private erroresPendientes: string[] = [];
  private aulaActualId?: string;
  private retoActualId?: string;
  private esActividadAula = false;
  private solucionesPorFase = new Map<number, string>();

  constructor(
    private motor: MotorEjecucionService,
    private loaderService: LoaderService,
    private router: Router,
    private progresoService: ProgresoService,
    private aulasService: AulasService
  ) {}

  ngOnInit(): void {
    this.cargarContextoInicial();
  }

  get faseActual(): FaseNivelDos {
    return this.fases[this.faseActualIndice];
  }

  get plantillaInicio(): string {
    return this.faseActual.evento;
  }

  get plantillaFin(): string {
    return '}';
  }

  get codigoCompleto(): string {
    const interior = this.codigoUsuario.trim();
    return interior
      ? `${this.plantillaInicio}\n  ${interior.replace(/\n/g, '\n  ')}\n${this.plantillaFin}`
      : `${this.plantillaInicio}\n${this.plantillaFin}`;
  }

  get lineasInteriores(): number[] {
    return this.codigoUsuario.length > 0
      ? this.codigoUsuario.split('\n').map((_, indice) => indice + 2)
      : [2];
  }

  get filasCodigoUsuario(): number {
    return Math.max(1, this.codigoUsuario.split('\n').length);
  }

  get temperaturaPorcentaje(): number {
    return Math.min(100, this.temperatura);
  }

  get pesoPorcentaje(): number {
    return Math.min(100, this.pesoCristales * 2);
  }

  get estadoTaladroTexto(): string {
    return {
      detenido: 'EN ESPERA',
      perforando: 'PERFORANDO',
      'liberando-vapor': 'LIBERANDO VAPOR',
      empacando: 'EMPACANDO CRISTALES',
      recargando: 'RECARGANDO CARBÓN',
      explosion: 'SOBRECARGA CRÍTICA',
      'banda-rota': 'BANDA TRANSPORTADORA ROTA',
      'sin-combustible': 'HORNO APAGADO',
      estable: 'SISTEMA ESTABLE',
ahogo: 'MOTOR AHOGADO',
descompuesto: 'ENGRANAJES ROTOS'
    }[this.estadoTaladro];
  }

  get intentosCalificables(): number {
    // Las ejecuciones obligatorias de cada fase no son reintentos. Solo se
    // contabiliza el intento exitoso final más los fallos reales del jugador.
    return this.erroresAcumulados + 1;
  }

  get estrellasAnimadas(): number[] {
    return Array.from({ length: this.estrellas }, (_, indice) => indice);
  }

  get mensajeRecompensa(): string {
    const palabra = this.estrellas === 1 ? 'estrella' : 'estrellas';
    return `¡Felicidades! Obtuviste ${this.estrellas} ${palabra} por completar la misión.`;
  }

  get tituloFallo(): string {
    if (this.estadoTaladro === 'banda-rota') return 'LA BANDA SE ROMPIÓ';
    if (this.estadoTaladro === 'sin-combustible') return 'EL HORNO SE APAGÓ';
    return 'EL TALADRO EXPLOTÓ';
  }

  ejecutarNivel(codigoDesdeConsola: string): void {
    if (this.ejecutando || this.faseCompletada || this.falloFase || this.gameOver) return;

    this.codigoUsuario = codigoDesdeConsola;

    this.iniciarTemporizador();
    this.detenerGameLoop();
    this.intentosEjecucion++;
    this.ejecutando = true;
    this.reiniciarMedidores();
    this.errores = [];
    this.estadoTaladro = 'perforando';
    this.bitacora = `Fase ${this.faseActual.numero}: los sensores comenzaron a enviar datos...`;

    this.falloFase1AndamiajeConfig = { operador: '', valor: 0, accion: '', tipoFallo: '' };

    if (this.faseActual.numero === 1) {
      const res = this.motor.evaluarAndamiajeFase1(codigoDesdeConsola);
      if (res.valido) {
        this.estrategias.estrategiaVaporCorrecta = true;
      } else {
        this.estrategias.estrategiaVaporCorrecta = false;
        this.falloFase1AndamiajeConfig = res;
      }
    } else {
      const resultado = this.motor.evaluarTaladro(codigoDesdeConsola, this.faseActual.numero as FaseTaladro);
      this.estrategias = resultado.banderas;
      this.erroresPendientes = resultado.errores.map(error => error.mensaje);
    }

    this.gameLoop = setInterval(() => this.actualizarSimulacion(), 240);
  }

  avanzarFase(): void {
    if (!this.faseCompletada || this.faseActualIndice >= this.fases.length - 1) return;
    this.faseActualIndice++;
    this.prepararFaseActual();
  }

  reintentarFase(): void {
    if (!this.falloFase || this.gameOver) return;
    this.falloFase = false;
    this.prepararFaseActual();
  }

  reiniciarNivel(): void {
    this.detenerTemporizador();
    this.detenerGameLoop();
    this.faseActualIndice = 0;
    this.intentosEjecucion = 0;
    this.erroresAcumulados = 0;
    this.tiempoSegundos = 0;
    this.tiempoInicioMs = 0;
    this.nivelCompletado = false;
    this.gameOver = false;
    this.estrellas = 0;
    this.calificacion = 0;
    this.guardandoProgreso = false;
    this.progresoGuardado = false;
    this.mensajeSincronizacion = '';
    this.solucionesPorFase.clear();
    this.prepararFaseActual();
  }

  salir(): void {
    this.router.navigate([this.esActividadAula ? '/pantalla-principal' : '/aventura']);
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
    this.detenerGameLoop();
  }

  private actualizarSimulacion(): void {
    const fase = this.faseActual.numero;
    this.estadoTaladro = 'perforando';
    // El valor debe superar el umbral para que el código enseñado (> 100)
    // también sea verdadero en la simulación, no solo en el evaluador.
    this.temperatura = Math.min(110, this.temperatura + 10);

    if (fase >= 2) {
      this.pesoCristales = Math.min(55, this.pesoCristales + 5);
    }
    if (fase >= 3) {
      this.combustible = Math.max(0, this.combustible - 10);
    }

    if (fase === 1) {
      if (this.estrategias.estrategiaVaporCorrecta) {
        if (this.temperatura > 100) this.resolverEvento('temperatura');
        return;
      }

      const conf = this.falloFase1AndamiajeConfig;
      let condicionCumplida = false;
      if (conf.operador === '>') condicionCumplida = this.temperatura > conf.valor;
      if (conf.operador === '<') condicionCumplida = this.temperatura < conf.valor;

      if (condicionCumplida && conf.tipoFallo) {
        this.fallarFase1Andamiaje(conf.tipoFallo);
        return;
      }

      if (this.temperatura > 100) {
        this.fallarFase1Andamiaje('SOBRECALENTAMIENTO');
      }
      return;
    }

    if (fase === 2) {
      if (this.temperatura > 100) this.temperatura = 0;
      if (this.pesoCristales > 50) this.resolverEvento('peso');
      return;
    }

    if (fase === 3) {
      if (this.temperatura > 100) this.temperatura = 0;
      if (this.pesoCristales > 50) this.pesoCristales = 0;
      if (this.combustible <= 0) this.resolverEvento('carbon');
      return;
    }

    if (fase === 4) {
      if (this.temperatura > 100 && !this.eventosResueltos.temperatura) {
        this.resolverEvento('temperatura');
      }
      if (this.pesoCristales > 50 && !this.eventosResueltos.peso && !this.falloFase) {
        this.resolverEvento('peso');
      }
      if (this.combustible <= 0 && !this.eventosResueltos.carbon && !this.falloFase) {
        this.resolverEvento('carbon');
      }
      if (this.eventosResueltos.temperatura && this.eventosResueltos.peso && this.eventosResueltos.carbon) {
        this.detenerGameLoop();
        setTimeout(() => this.completarFase(), 850);
      }
    }
  }

  private resolverEvento(tipo: TipoEventoTaladro): void {
    const estrategiaCorrecta = {
      temperatura: this.estrategias.estrategiaVaporCorrecta,
      peso: this.estrategias.estrategiaPesoCorrecta,
      carbon: this.estrategias.estrategiaCarbonCorrecta
    }[tipo];

    if (!estrategiaCorrecta) {
      this.fallarFase(tipo);
      return;
    }

    this.eventosResueltos[tipo] = true;
    if (tipo === 'temperatura') {
      this.estadoTaladro = 'liberando-vapor';
      this.temperatura = 0;
      this.bitacora = 'El listener detectó el calor y liberó el vapor.';
    }
    if (tipo === 'peso') {
      this.estadoTaladro = 'empacando';
      this.pesoCristales = 0;
      this.bitacora = 'La banda empacó los cristales antes de romperse.';
    }
    if (tipo === 'carbon') {
      this.estadoTaladro = 'recargando';
      this.combustible = 100;
      this.bitacora = 'El depósito recibió carbón y el horno siguió encendido.';
    }

    if (this.faseActual.numero < 4) {
      this.detenerGameLoop();
      setTimeout(() => this.completarFase(), 900);
    }
  }

  private completarFase(): void {
    if (this.falloFase || this.gameOver) return;
    this.solucionesPorFase.set(this.faseActual.numero, this.codigoCompleto);
    this.ejecutando = false;
    this.faseCompletada = true;
    this.estadoTaladro = 'estable';
    this.bitacora = `Fase ${this.faseActual.numero} superada. El protocolo quedó activo.`;

    if (this.faseActualIndice === this.fases.length - 1) {
      this.nivelCompletado = true;
      this.finalizarNivel();
      return;
    }

    // Las fases intermedias continúan directamente, igual que las transiciones
    // del Nivel 1. La animación de recompensa se reserva para el final.
    this.avanzarFase();
  }

  fallarFase1Andamiaje(tipoFallo: string): void {
    this.detenerGameLoop();
    this.ejecutando = false;
    this.falloFase = true;
    this.erroresAcumulados++;
    this.errores = ['Configuración incorrecta del andamiaje.'];

    if (tipoFallo === 'AHOGO') {
      this.estadoTaladro = 'ahogo' as any;
      this.bitacora = 'El motor se ahogó por liberar vapor antes de tiempo.';
    } else if (tipoFallo === 'SOBRECALENTAMIENTO') {
      this.estadoTaladro = 'explosion';
      this.bitacora = 'El taladro se sobrecalentó.';
    } else if (tipoFallo === 'DESCOMPUESTO') {
      this.estadoTaladro = 'descompuesto' as any;
      this.bitacora = 'Apagar el motor de golpe dañó los engranajes.';
    } else {
      this.estadoTaladro = 'explosion';
      this.bitacora = 'El taladro explotó por configuración incorrecta.';
    }
  }

  private fallarFase(tipo: TipoEventoTaladro): void {
    this.detenerGameLoop();
    this.ejecutando = false;
    this.falloFase = true;
    this.erroresAcumulados++;
    this.errores = this.erroresPendientes.length > 0
      ? this.erroresPendientes
      : ['El evento no tenía una estrategia válida.'];

    if (tipo === 'temperatura') {
      this.estadoTaladro = 'explosion';
      this.bitacora = 'La temperatura llegó al límite y el taladro explotó.';
    }
    if (tipo === 'peso') {
      this.estadoTaladro = 'banda-rota';
      this.bitacora = 'La carga superó el límite y rompió la banda transportadora.';
    }
    if (tipo === 'carbon') {
      this.estadoTaladro = 'sin-combustible';
      this.bitacora = 'El carbón se agotó y el fuego del taladro se apagó.';
    }

    if (false) {
      this.gameOver = true;
      this.bitacora = 'La máquina sufrió daños irreparables. Reinicia la misión.';
    }
  }

  private prepararFaseActual(): void {
    this.detenerGameLoop();
    this.codigoUsuario = '';
    this.reiniciarMedidores();
    this.ejecutando = false;
    this.faseCompletada = false;
    this.falloFase = false;
    this.pistaVisible = false;
    this.ayudaVisible = false;
    this.errores = [];
    this.erroresPendientes = [];
    this.estrategias = this.banderasVacias();
    this.estadoTaladro = 'detenido';
    this.bitacora = `Fase ${this.faseActual.numero} preparada. Construye la estrategia dentro del evento.`;
    this.pestanaInventario = 'acciones';
  }

  private reiniciarMedidores(): void {
    this.temperatura = 0;
    this.pesoCristales = 0;
    this.combustible = 100;
    this.eventosResueltos = { temperatura: false, peso: false, carbon: false };
  }

  private iniciarTemporizador(): void {
    if (this.tiempoInicioMs > 0) return;
    this.tiempoInicioMs = Date.now();
    this.temporizador = setInterval(() => {
      this.tiempoSegundos = Math.floor((Date.now() - this.tiempoInicioMs) / 1000);
    }, 1000);
  }

  private finalizarNivel(): void {
    this.detenerTemporizador();
    const intentos = this.intentosCalificables;

    // Misma rúbrica configurada para el Nivel 1 en el backend:
    // 3 estrellas hasta 60 s, 2 hasta 120 s y 1 después de ese tiempo.
    this.calificacion = intentos <= 1 ? 10 : intentos === 2 ? 8 : 6;
    this.estrellas = this.tiempoSegundos <= 60 ? 3 : this.tiempoSegundos <= 120 ? 2 : 1;
    if (intentos > 3) this.estrellas = Math.max(1, this.estrellas - 1);
    this.guardarProgreso();
  }

  private cargarContextoInicial(): void {
    const aulaId = localStorage.getItem('aulaActiva');
    const retoId = localStorage.getItem('retoActivo');

    if (!aulaId || !retoId) {
      this.loaderService.ocultar();
      return;
    }

    this.cargandoContextoAula = true;
    this.loaderService.mostrar('CARGANDO ACTIVIDAD');
    this.aulasService.retosDelAula(aulaId).subscribe({
      next: retos => {
        const reto = retos.find(item => item.id === retoId && item.reto_nivel_id === 2);
        if (reto) {
          this.aulaActualId = aulaId;
          this.retoActualId = reto.id;
          this.esActividadAula = true;
          this.aplicarConfiguracionAula(reto);
        } else {
          this.limpiarContextoAula();
        }
        this.cargandoContextoAula = false;
        this.loaderService.ocultar();
      },
      error: () => {
        this.cargandoContextoAula = false;
        this.limpiarContextoAula();
        this.loaderService.ocultar();
      }
    });
  }

  private aplicarConfiguracionAula(reto: RetoPersonalizadoResponse): void {
    let parametros: ParametrosEvaluacion | undefined;
    const parametrosRecibidos: unknown = reto.parametros_evaluacion;
    if (typeof parametrosRecibidos === 'string') {
      try {
        parametros = JSON.parse(parametrosRecibidos) as ParametrosEvaluacion;
      } catch {
        parametros = undefined;
      }
    } else {
      parametros = parametrosRecibidos as ParametrosEvaluacion;
    }

    this.antiCopiaActivo = parametros?.anti_copia ?? false;
    const fasesSeleccionadas = parametros?.fases_seleccionadas
      ?.map(Number)
      .filter(numero => Number.isInteger(numero) && numero >= 1 && numero <= 4);

    if (fasesSeleccionadas?.length) {
      const seleccion = new Set(fasesSeleccionadas);
      const rawFases = nivel2Data.fases as unknown as FaseNivelDos[];
      this.fases = rawFases.filter(fase => seleccion.has(fase.numero));
    }
  }

  private guardarProgreso(): void {
    if (this.guardandoProgreso || this.progresoGuardado) return;

    // El alias /prototipo permite revisar el nivel sin iniciar sesión. En ese
    // modo la partida es deliberadamente local y no debe generar peticiones
    // fallidas ni alterar el progreso oficial del jugador.
    if (this.router.url.startsWith('/prototipo/')) {
      this.mensajeSincronizacion = 'Prueba local completada; el progreso oficial no fue modificado.';
      return;
    }

    const codigoSolucion = [...this.solucionesPorFase.entries()]
      .sort(([faseA], [faseB]) => faseA - faseB)
      .map(([fase, codigo]) => `// Fase ${fase}\n${codigo}`)
      .join('\n\n');

    this.guardandoProgreso = true;
    this.mensajeSincronizacion = 'Guardando progreso y recompensa...';
    this.progresoService.guardarProgreso({
      reto_nivel_id: 2,
      tiempo_segundos: this.tiempoSegundos,
      intentos: this.intentosCalificables,
      codigo_solucion: codigoSolucion,
      aula_id: this.aulaActualId,
      reto_personalizado_id: this.retoActualId
    }).subscribe({
      next: respuesta => {
        this.guardandoProgreso = false;
        this.progresoGuardado = true;
        this.estrellas = respuesta.estrellas_obtenidas;
        this.mensajeSincronizacion = respuesta.mensaje;
        if (this.esActividadAula) this.limpiarContextoAula();
      },
      error: () => {
        this.guardandoProgreso = false;
        this.mensajeSincronizacion = (
          'La misión se completó localmente, pero el progreso no pudo sincronizarse.'
        );
      }
    });
  }

  private limpiarContextoAula(): void {
    localStorage.removeItem('aulaActiva');
    localStorage.removeItem('retoActivo');
  }

  private banderasVacias(): BanderasEstrategiaTaladro {
    return {
      estrategiaVaporCorrecta: false,
      estrategiaPesoCorrecta: false,
      estrategiaCarbonCorrecta: false
    };
  }

  private detenerTemporizador(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = undefined;
  }

  private detenerGameLoop(): void {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.gameLoop = undefined;
  }

}
