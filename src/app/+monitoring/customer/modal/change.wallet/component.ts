
import {map, mergeMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { MinerService } from '../../../../providers/miner.service';
import { WalletService } from '../../../../providers/wallet.service';
import { Subject ,  Observable } from 'rxjs';
import { UserService } from '../../../../providers/user.service';
import { AuthService } from '../../../../providers/auth.service';

@Component({
  templateUrl: './component.html',
})
export class ChangeWalletModalComponent implements OnInit {
  public walletList: any[] = [];
  public dualCoinWalletList: any[] = [];
  public hasDualCoin: boolean = false;
  public currentWallets = {
    firstIDSet: new Set(),
    secondIDSet: new Set()
  };
  public coin = {
    main: '',
    dual: ''
  };

  private onClose: Subject<any>;
  private isModified = false;
  private form: any;

  constructor(private bsModalRef: BsModalRef,
              private authService: AuthService,
              private userService: UserService,
              private walletService: WalletService,
              private minerService: MinerService) {
    this.onClose = new Subject();
  }

  ngOnInit(): void {
    this.form = {
      userID: 0,
      minerIDs: [],
      walletID: 0,
      dualWalletID: 0
    };
  }

  public setModal(minerList: any[]): void {
    let userIDSet: Set<number> = new Set();
    for (let miner of minerList) {
      userIDSet.add(miner.user_id);
      this.form.minerIDs.push(miner.id);
    }
    console.log(userIDSet);
    if (userIDSet.size > 1) {
      alert('사용자는 하나여야 합니다.');
      this.close('DEFERENCE_USER');
      return;
    }
    this.form.userID = userIDSet.values().next().value;
    this.checkMiningType().subscribe(obj => {
      if (obj === undefined) {
        return;
      }
      this.currentWallets.firstIDSet = obj.walletIDSet;
      this.currentWallets.secondIDSet = obj.dualWalletIDSet;
      if (this.currentWallets.secondIDSet.size > 0) {
        this.hasDualCoin = true;
      }

      if (this.hasDualCoin) {
        if (parseInt(this.authService.getInfo().id) === this.form.userID && this.authService.getInfo().role === 'WHOLESALE') {
          this.setDualCoinNWalletListForSelf().subscribe(obj => {
            if (obj) {
              this.coin.main = obj.mineCoin;
              this.walletList = obj.walletList;
              this.coin.dual = obj.dualCoin;
              this.dualCoinWalletList = obj.dualWalletList;
            }
          });
        } else {
          this.userService.getItemByID(this.form.userID).subscribe(item => {
            if (item.user_has_user.has_second_coin) {
              this.setDualCoinNWalletListForSelf().subscribe(obj => {
                if (obj) {
                  this.coin.main = obj.mineCoin;
                  this.walletList = obj.walletList;
                  this.coin.dual = obj.dualCoin;
                  this.dualCoinWalletList = obj.dualWalletList;
                }
              })
            } else {
              this.setDualCoinNWalletListForWholesale().subscribe(obj => {
                if (obj) {
                  this.coin.main = obj.mineCoin;
                  this.walletList = obj.walletList;
                  this.coin.dual = obj.dualCoin;
                  this.dualCoinWalletList = obj.dualWalletList;
                }
              });
            }
          })
        }
      } else {
        this.setSingleCoinNWalletList().subscribe(list => {
          if (list) {
            this.walletList = list;
          }
        })
      }

    });
  }

  public selectWallet(id: string) {
    this.form.walletID = parseInt(id)
  }

  public selectDualWallet(id: string) {
    this.form.dualWalletID = parseInt(id)
  }

  public confirm() {
    if (this.form.walletID < 1) {
      alert('지갑을 선택해주세요.');
      return;
    }
    if (this.hasDualCoin && this.form.dualWalletID < 1) {
      alert('듀얼 코인 지갑을 선택해주세요.');
      return;
    }
    this.minerService.changeWallet(this.form).subscribe(() => {
      alert('지갑이 변경되었습니다.');
      this.isModified = true;
      this.close('SUCCESS');
      return;
    });
  }

  public close(retCode: string) {
    this.onClose.next({isModified: this.isModified, retCode: retCode});
  }

  private setDualCoinNWalletListForSelf() {
    return this.walletService.getListByUserID(this.form.userID).pipe(map(list => {
      const walletMap = new Map();
      const coinMap = new Map();
      for (const wallet of list) {
        walletMap.set(wallet.id, wallet);
        if (coinMap.has(wallet.coin) === false) {
          coinMap.set(wallet.coin, [wallet])
        } else {
          coinMap.get(wallet.coin).push(wallet)
        }
      }
      let coinSet = new Set();
      this.currentWallets.firstIDSet.forEach(value => {
        coinSet.add(walletMap.get(value).coin)
      });
      if (coinSet.size > 1) {
        if (confirm('선택하신 채굴기는 서로 다른 코인을 채굴중이므로 같은 지갑을 사용할 수 없습니다. 모두 같은 코인을 채굴하도록 설정한 후 같은 지갑을 사용하도록 변경하시겠습니까?')) {
          this.close('DEFERENCE_COIN');
        } else {
          this.close('SUCCESS');
        }
        return;
      }
      const mainCoin = coinSet.values().next().value;
      const walletList = coinMap.get(mainCoin);

      coinSet = new Set();
      this.currentWallets.secondIDSet.forEach(value => {
        coinSet.add(walletMap.get(value).coin)
      });
      if (coinSet.size > 1) {
        if (confirm('선택하신 채굴기는 서로 다른 코인을 채굴중이므로 같은 지갑을 사용할 수 없습니다. 모두 같은 코인을 채굴하도록 설정한 후 같은 지갑을 사용하도록 변경하시겠습니까?')) {
          this.close('DEFERENCE_COIN');
        } else {
          this.close('SUCCESS');
        }
        return;
      }
      const dualCoin = coinSet.values().next().value;
      const dualWalletList = coinMap.get(dualCoin);
      return {
        mineCoin: mainCoin,
        walletList: walletList,
        dualCoin: dualCoin,
        dualWalletList: dualWalletList
      };
    }));
  }

  private setDualCoinNWalletListForWholesale() {
    return this.getCoinNWalletList(this.form.userID, this.currentWallets.firstIDSet).pipe(mergeMap(obj => {
      console.log('setDualCoinNWalletListForWholesale', obj);
      return this.getCoinNWalletList(this.authService.getInfo().id,
        this.currentWallets.secondIDSet).pipe(map(dualObj => {
          if (dualObj.coin === undefined) {
            if (confirm('홀세일러의 기존 등록된 지갑이 없습니다. 코인 변경을 통해서 코인 및 지갑을 설정하시겠습니까?')) {
              this.close('EMPTY');
            } else {
              this.close('SUCCESS');
            }
            return;
          } else {
            return {
              mineCoin: obj.coin,
              walletList: obj.walletList,
              dualCoin: dualObj.coin,
              dualWalletList: dualObj.walletList
            };
          }
        }
      ));
    }));
  }

  private setSingleCoinNWalletList(): Observable<any[]> {
    return this.getCoinNWalletList(this.form.userID, this.currentWallets.firstIDSet).pipe(map(obj => {
      console.log('setSingleCoinNWalletList', obj);
      return obj.walletList
    }));
  }

  private getCoinNWalletList(userID, walletIDSet) {
    return this.walletService.getListByUserID(userID).pipe(map(list => {
      let walletMap = new Map();
      let coinMap = new Map();
      for (const wallet of list) {
        walletMap.set(wallet.id, wallet);
        if (coinMap.has(wallet.coin) === false) {
          coinMap.set(wallet.coin, [wallet])
        } else {
          coinMap.get(wallet.coin).push(wallet)
        }
      }
      const coinSet = new Set();
      walletIDSet.forEach(value => {
        if (walletMap.has(value)) {
          coinSet.add(walletMap.get(value).coin)
        }
      });
      if (coinSet.size > 1) {
        if (confirm('선택하신 채굴기는 서로 다른 코인을 채굴중이므로 같은 지갑을 사용할 수 없습니다. 모두 같은 코인을 채굴하도록 설정한 후 같은 지갑을 사용하도록 변경하시겠습니까?')) {
          this.close('DEFERENCE_COIN');
        } else {
          this.close('SUCCESS');
        }
        return;
      }
      return {
        coin: coinSet.values().next().value,
        walletList: coinMap.get(coinSet.values().next().value)
      };
    }));

  }

  private checkMiningType() {
    return this.minerService.getCommandListByMinerIDs(this.form.minerIDs).pipe(map(list => {
      const commandList = list;
      const walletIDSet: Set<number> = new Set(), dualWalletIDSet = new Set();
      let mainCoinCount = 0, dualCoinCount = 0;
      for (const command of commandList) {
        if (command.wallet_id !== 0) {
          walletIDSet.add(command.wallet_id);
          mainCoinCount++;
        }
        if (command.dual_wallet_id !== 0) {
          dualWalletIDSet.add(command.dual_wallet_id);
          dualCoinCount++;
        }
      }
      if (dualCoinCount > 0 && mainCoinCount !== dualCoinCount) {
        if (confirm('선택하신 채굴기는 서로 다른 코인을 채굴중이므로 같은 지갑을 사용할 수 없습니다. 모두 같은 코인을 채굴하도록 설정한 후 같은 지갑을 사용하도록 변경하시겠습니까?')) {
          this.close('DEFERENCE_COIN');
        } else {
          this.close('SUCCESS');
        }
        return;
      }
      return {
        walletIDSet: walletIDSet,
        dualWalletIDSet: dualWalletIDSet
      }
    }));
  }
}
