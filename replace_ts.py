import re

with open('src/app/consola-codigo/consola-codigo.component.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'DomSanitizer' not in content:
    content = content.replace("import { NotificationService } from '../services/notification.service';", "import { NotificationService } from '../services/notification.service';\nimport { DomSanitizer, SafeHtml } from '@angular/platform-browser';")

if 'private sanitizer = inject(DomSanitizer);' not in content:
    content = content.replace("private notificationService = inject(NotificationService);", "private notificationService = inject(NotificationService);\n  private sanitizer = inject(DomSanitizer);")

ghost_method = '''
  formatearGhost(texto: string): SafeHtml {
    const primerIndice = texto.indexOf('▯');
    if (primerIndice === -1) return this.sanitizer.bypassSecurityTrustHtml(texto.replace(/ /g, '&nbsp;'));
    
    const antes = texto.substring(0, primerIndice).replace(/ /g, '&nbsp;');
    const despues = texto.substring(primerIndice + 1).replace(/ /g, '&nbsp;');
    
    return this.sanitizer.bypassSecurityTrustHtml(${antes}<span class="parpadeo">▯</span>);
  }
'''

if 'formatearGhost(' not in content:
    content = content.replace("export class ConsolaCodigoComponent {", "export class ConsolaCodigoComponent {\n" + ghost_method)

with open('src/app/consola-codigo/consola-codigo.component.ts', 'w', encoding='utf-8') as f:
    f.write(content)
