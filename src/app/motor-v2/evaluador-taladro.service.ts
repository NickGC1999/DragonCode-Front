import { Injectable } from '@angular/core';
import {
  BanderasEstrategiaTaladro,
  ErrorEjecucion,
  FaseTaladro,
  ResultadoEvaluacionTaladro
} from './evaluador-nivel';

@Injectable({ providedIn: 'root' })
export class EvaluadorTaladroService {
  private readonly estrategiaTemperaturaRegex = /si\s*\(\s*taladro\.temperatura\s*>\s*100\s*\)\s*\{\s*taladro\.liberarVapor\(\);?\s*\}/i;
  private readonly estrategiaPesoRegex = /si\s*\(\s*taladro\.pesoCarga\s*>\s*50\s*\)\s*\{\s*taladro\.empacarCristales\(\);?\s*\}/i;
  private readonly estrategiaCarbonRegex = /si\s*\(\s*taladro\.carbon\s*==\s*0\s*\)\s*\{\s*taladro\.recargarCarbon\(\);?\s*\}/i;

  evaluarAndamiajeFase1(codigo: string): { valido: boolean, tipoFallo: string, operador: string, valor: number, accion: string } {
    const defaultRes = { valido: false, tipoFallo: 'SOBRECALENTAMIENTO', operador: '', valor: 0, accion: '' };
    const andamiajeRegex = /si\s*\(\s*taladro\.temperatura\s*([><])\s*(\d+)\s*\)\s*\{\s*taladro\.(liberarVapor|apagarMotor|extraerCarbon)\(\);?\s*\}/i;
    const match = codigo.match(andamiajeRegex);
    
    if (!match) return defaultRes;

    const operador = match[1];
    const valor = parseInt(match[2], 10);
    const accion = match[3];

    const baseRes = { operador, valor, accion };

    if (operador === '>' && valor === 100 && accion === 'liberarVapor') {
      return { valido: true, tipoFallo: '', ...baseRes };
    }

    if (accion === 'liberarVapor') {
      if (valor <= 100 || operador === '<') return { valido: false, tipoFallo: 'AHOGO', ...baseRes };
    }

    if (accion === 'apagarMotor') {
      return { valido: false, tipoFallo: 'DESCOMPUESTO', ...baseRes };
    }

    // Default Fallback absoluto: cualquier otra combinación, sintaxis rota o caso no contemplado colapsa la máquina
    return { valido: false, tipoFallo: 'SOBRECALENTAMIENTO', ...baseRes };
  }

  evaluar(codigo: string, fase: FaseTaladro = 1): ResultadoEvaluacionTaladro {
    const errores: ErrorEjecucion[] = [];
    const banderas: BanderasEstrategiaTaladro = {
      estrategiaVaporCorrecta: false,
      estrategiaPesoCorrecta: false,
      estrategiaCarbonCorrecta: false
    };

    if (fase === 1) {
      const fase1Regex = /evento\s*\(\s*taladro\.sobrecalentamiento\s*\)\s*\{\s*si\s*\(\s*taladro\.temperatura\s*>\s*100\s*\)\s*\{\s*taladro\.liberarVapor\(\);?\s*\}\s*\}/i;
      banderas.estrategiaVaporCorrecta = fase1Regex.test(codigo);
      if (!banderas.estrategiaVaporCorrecta) {
        errores.push({ mensaje: this.explicarErrorTemperatura(codigo, fase) });
      }
    }

    if (fase === 2) {
      const fase2Regex = /evento\s*\(\s*taladro\.sobrecarga\s*\)\s*\{\s*si\s*\(\s*taladro\.pesoCarga\s*>\s*50\s*\)\s*\{\s*taladro\.empacarCristales\(\);?\s*\}\s*\}/i;
      banderas.estrategiaPesoCorrecta = fase2Regex.test(codigo);
      if (!banderas.estrategiaPesoCorrecta) {
        errores.push({ mensaje: this.explicarErrorPeso(codigo, fase) });
      }
    }

    if (fase === 3) {
      const fase3Regex = /evento\s*\(\s*taladro\.tanqueVacio\s*\)\s*\{\s*si\s*\(\s*taladro\.carbon\s*==\s*0\s*\)\s*\{\s*taladro\.recargarCarbon\(\);?\s*\}\s*\}/i;
      banderas.estrategiaCarbonCorrecta = fase3Regex.test(codigo);
      if (!banderas.estrategiaCarbonCorrecta) {
        errores.push({ mensaje: this.explicarErrorCarbon(codigo, fase) });
      }
    }

    if (fase === 4) {
      const plantillaCorrecta = /evento\s*\(\s*taladro\.operacionCompleta\s*\)\s*\{/i.test(codigo);
      banderas.estrategiaVaporCorrecta = plantillaCorrecta && this.estrategiaTemperaturaRegex.test(codigo);
      banderas.estrategiaPesoCorrecta = plantillaCorrecta && this.estrategiaPesoRegex.test(codigo);
      banderas.estrategiaCarbonCorrecta = plantillaCorrecta && this.estrategiaCarbonRegex.test(codigo);

      if (!banderas.estrategiaVaporCorrecta) {
        errores.push({ mensaje: this.explicarErrorTemperatura(codigo, fase) });
      }
      if (!banderas.estrategiaPesoCorrecta) {
        errores.push({ mensaje: this.explicarErrorPeso(codigo, fase) });
      }
      if (!banderas.estrategiaCarbonCorrecta) {
        errores.push({ mensaje: this.explicarErrorCarbon(codigo, fase) });
      }

      const ordenCorrecto = new RegExp(
        this.estrategiaTemperaturaRegex.source + '.*?' + 
        this.estrategiaPesoRegex.source + '.*?' + 
        this.estrategiaCarbonRegex.source, 'is'
      );

      if (errores.length === 0 && !ordenCorrecto.test(codigo)) {
        errores.push({ mensaje: 'Los tres protocolos deben conservar el orden: temperatura, peso y carbón.' });
        banderas.estrategiaVaporCorrecta = false;
        banderas.estrategiaPesoCorrecta = false;
        banderas.estrategiaCarbonCorrecta = false;
      }
    }

    return {
      valido: errores.length === 0,
      codigoSanitizado: codigo.replace(/\s+/g, ''), // Mantenemos sanitizado solo para debug interno o logs
      banderas,
      errores
    };
  }

  private explicarErrorTemperatura(codigo: string, fase: FaseTaladro): string {
    const evento = fase === 4 ? 'operacionCompleta' : 'sobrecalentamiento';
    const eventoRegex = new RegExp(`evento\\s*\\(\\s*taladro\\.${evento}\\s*\\)\\s*\\{`, 'i');
    
    if (!eventoRegex.test(codigo)) {
      return 'La plantilla fija del evento de temperatura fue alterada.';
    }
    if (!/si\s*\(\s*taladro\.temperatura\s*>\s*100\s*\)/i.test(codigo)) {
      return 'Falta comprobar si la temperatura supera 100.';
    }
    if (!/taladro\.liberarVapor\(\);?/i.test(codigo)) {
      return 'La condición de temperatura necesita taladro.liberarVapor();.';
    }
    return 'La acción de vapor debe estar dentro de su condición.';
  }

  private explicarErrorPeso(codigo: string, fase: FaseTaladro): string {
    const evento = fase === 4 ? 'operacionCompleta' : 'sobrecarga';
    const eventoRegex = new RegExp(`evento\\s*\\(\\s*taladro\\.${evento}\\s*\\)\\s*\\{`, 'i');
    
    if (!eventoRegex.test(codigo)) {
      return 'La plantilla fija del evento de peso fue alterada.';
    }
    if (!/si\s*\(\s*taladro\.pesoCarga\s*>\s*50\s*\)/i.test(codigo)) {
      return 'Falta comprobar si el peso de cristales supera 50.';
    }
    if (!/taladro\.empacarCristales\(\);?/i.test(codigo)) {
      return 'La condición de peso necesita taladro.empacarCristales();.';
    }
    return 'La acción de empaquetado debe estar dentro de su condición.';
  }

  private explicarErrorCarbon(codigo: string, fase: FaseTaladro): string {
    const evento = fase === 4 ? 'operacionCompleta' : 'tanqueVacio';
    const eventoRegex = new RegExp(`evento\\s*\\(\\s*taladro\\.${evento}\\s*\\)\\s*\\{`, 'i');

    if (!eventoRegex.test(codigo)) {
      return 'La plantilla fija del evento de combustible fue alterada.';
    }
    if (!/si\s*\(\s*taladro\.carbon\s*==\s*0\s*\)/i.test(codigo)) {
      return 'Falta comprobar si el carbón llegó a 0.';
    }
    if (!/taladro\.recargarCarbon\(\);?/i.test(codigo)) {
      return 'La condición de combustible necesita taladro.recargarCarbon();.';
    }
    return 'La recarga de carbón debe estar dentro de su condición.';
  }
}
