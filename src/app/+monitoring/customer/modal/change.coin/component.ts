
import {map} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { WalletService } from '../../../../providers/wallet.service';
import { MinerService } from '../../../../providers/miner.service';
import { PcService } from '../../../../providers/pc.service';
import { Subject } from 'rxjs';
import { AuthService } from '../../../../providers/auth.service';
import { MainCoinForETHClaymore, SecondCoinForETHClaymore } from '../../../../shared/consts';
import { UserService } from '../../../../providers/user.service';

@Component({
  templateUrl: './component.html',
})
export class ChangeCoinModalComponent implements OnInit {
  public view = {
    coinList: [],
    dualCoinList: [],
    selectedCoin: '0',
    selectedDualCoin: '',
    walletMap: new Map(),
    dualWalletMap: new Map(),
    miningType: '',
    selectedMiningType: 'dual',
    hasDualCoinInWholesale: false,
  };
  public errorType = {
    notFoundMainWallet: false,
    notFoundSubWallet: false
  };

  private isModified = false;
  private form: any;
  private onClose: Subject<boolean>;

  constructor(private bsModalRef: BsModalRef,
              private walletService: WalletService,
              private authService: AuthService,
              private pcService: PcService,
              private userService: UserService,
              private minerService: MinerService) {
    this.onClose = new Subject();
  }

  ngOnInit(): void {
    this.form = {
      userID: 0,
      minerIDs: [],
      walletID: 0,
      dualWalletID: 0,
      ratio: 0
    };
  }

  public setModal(minerList: any[]): void {
    let userIDSet: Set<number> = new Set();
    let pcIDs: number[] = [];
    for (let miner of minerList) {
      userIDSet.add(miner.user_id);
      pcIDs.push(miner.pc_id);
      this.form.minerIDs.push(miner.id);
    }
    if (userIDSet.size > 1) {
      alert('사용자는 하나여야 합니다.');
      return;
    }
    this.form.userID = userIDSet.values().next().value;
    this.setWalletMap(this.form.userID).subscribe(map => {
      this.view.walletMap = map;
      this.view.dualWalletMap = map;
    });
    const coinObj = JSON.parse(minerList[0].coin);
    this.view.selectedCoin = coinObj.main;
    if (coinObj.sub !== 'null') {
      this.view.selectedDualCoin = coinObj.sub
    }
    this.setCoinList(pcIDs).subscribe(list => {
      this.view.coinList = list;
      for (const coin of this.view.coinList) {
        if (coin in MainCoinForETHClaymore) {
          Object.keys(SecondCoinForETHClaymore)
            .map(key => (this.view.dualCoinList.push(key)));
          break;
        }
      }
      if (this.view.dualCoinList.length === 0) {
        this.view.miningType = 'single';
      } else {
        if (this.authService.getInfo().role === 'WHOLESALE') {
          this.view.miningType = 'needCheck';
          if (parseInt(this.authService.getInfo().id) != this.form.userID) {
            this.getUser().subscribe(item => {
              console.log('item.user_has_user.has_second_coin', item.user_has_user.has_second_coin);
              if (item.user_has_user.has_second_coin === 0) {
                this.setWalletMap(parseInt(this.authService.getInfo().id)).subscribe(map => {
                  console.log(map);
                  this.view.hasDualCoinInWholesale = true;
                  this.view.dualWalletMap = map;
                })
              }
            });
          }
        } else {
          this.getUser().subscribe(item => {
            if (item.user_has_user.has_second_coin === 1) {
              this.view.miningType = 'needCheck';
            } else {
              this.view.miningType = 'single';
            }
            console.log(this.view);
          })
        }
      }
    });
  }

  public selectMiningType(type:string) {
    this.view.selectedMiningType = type;
  }

  public selectWallet(id: string) {
    this.form.walletID = parseInt(id);
  }

  public selectCoin(coin: string) {
    this.view.selectedCoin = coin;
  }

  public selectDualWallet(id: string) {
    this.form.dualWalletID = parseInt(id);
  }

  public selectDualCoin(coin: string) {
    this.view.selectedDualCoin = coin;
  }

  public confirm() {
    if (this.form.walletID < 1) {
      this.errorType.notFoundMainWallet = true;
    } else {
      this.errorType.notFoundMainWallet = false;
    }
    if (this.view.miningType === 'dual' && this.form.dualWalletID < 1) {
      this.errorType.notFoundSubWallet = true;
    }
    if (this.errorType.notFoundMainWallet || this.errorType.notFoundSubWallet) {
      alert('지갑을 선택하세요.');
      return;
    }
    if (this.view.miningType === 'single') {
      this.form.ratio = 0;
    } else {
      this.form.ratio = parseInt(this.form.ratio);
      if (this.form.ratio < 0 || this.form.ratio > 100) {
        alert('코인에 입력할 수 있는 해시파워는 0이상, 100이하입니다.');
        return;
      }
    }
    this.minerService.changeWallet(this.form).subscribe((map) => {
      if (map.successCnt && map.successCnt > 0) {
        alert('코인이 변경되었습니다.');
        this.isModified = true;
        this.close();
      }
    });
  }

  public next() {
    this.view.miningType = this.view.selectedMiningType;
  }

  public close() {
    this.onClose.next(this.isModified);
  }

  private getUser() {
    return this.userService.getItemByID(this.form.userID)
  }

  private setWalletMap(userID: number) {
    return this.walletService.getListByUserID(userID).pipe(map((list: any[]) => {
      const map = new Map();
      for (let wallet of list) {
        if (map.has(wallet.coin) === false) {
          map.set(wallet.coin, [wallet]);
        } else {
          map.get(wallet.coin).push(wallet);
        }
      }
      return map;
    }));
  }

  private setCoinList(pcIDs: number[]) {
    return this.pcService.coinMapByIDs(pcIDs).pipe(map((map) => {
      const list = [];
      for (let key of Object.keys(map)) {
        for (let pcCoin of map[key]) {
          if (list.indexOf(pcCoin.coin) === -1) {
            list.push(pcCoin.coin);
          }
        }
      }
      return list;
    }));
  }

  // jeKim
  public isEmptyMainCoinWalletList() {
    if (this.view.selectedCoin === '0') {
      return false;
    }
    return !this.view.walletMap.has(this.view.selectedCoin);
  }

  public isEmptySecondCoinWalletList() {
    if (!this.view.selectedDualCoin || !this.view.walletMap.has(this.view.selectedCoin)) {
      return false;
    }
    return !this.view.dualWalletMap.has(this.view.selectedDualCoin);
  }
  // end jeKim
}
