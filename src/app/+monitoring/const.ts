export class CONSTS {
  public static MinerStatusMap =
    [{ key: '정상', value: 'RUN'},
      { key: '속도저하', value: 'ERROR_HASH_RATE'},
      { key: '장비멈춤', value: 'ERROR_NO_WORKER'}];
  public static SHOW_ALL = 'SHOW_ALL';

  public static DEFAULT_PER_PAGE = 500;
  public static ALERT_MUST_CHECK_PC_LIST = '선택된 채굴기가 없습니다.';
}

export enum MinerNormalStatus {
  Stop = 'STOP',
  Reboot = 'REBOOT',
  Run = 'RUN'
}

export enum MinerErrorStatus {
  HashRate = 'ERROR_HASH_RATE',
  NoWorker = 'ERROR_NO_WORKER',
  OverTemp = 'ERROR_OVER_TEMPERATURE',
}
