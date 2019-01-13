import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayMinerStatus'
})

export class DisplayMinerStatusPipe implements PipeTransform {
  public transform(status: string): string {
    if (status === '' || !status) {
      return '';
    }
    switch (status) {
      case 'RUN':
        return '정상';
      case 'ERROR_HASH_RATE':
        return '속도저하';
      case 'ERROR_NO_WORKER':
        return '장비멈춤';
      case 'ERROR_OVER_TEMPERATURE':
        return '온도상승';
      case 'STOP':
        return '정지';
      case 'REBOOT':
        return '재부팅';
      case 'RESTART':
        return '재시작';
      default:
        console.log('DisplayMinerStatusPipe Error - Unregistered status:' + status);
        return '';
    }
  }
}
