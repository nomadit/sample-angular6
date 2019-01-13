import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../providers/auth.service';
import { ChangeViewService} from '../../providers/change.view.service';

/**
 * This class represents the navigation bar component.
 */
@Component({
  selector: 'sd-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public user: any = {};

  constructor(private router: Router,
              private auth: AuthService,
              private viewService: ChangeViewService) {
  }

  public currentMenu(menu: string) {
    if (this.router.url.indexOf(menu) >= 0) {
      return 'active';
    } else {
      return '';
    }
  }

  public ngOnInit() {
    this.user = this.auth.getInfo();
    if (this.user === null) {
      this.logout();
      return;
    }
  }

  public closeNav() {
    if (this.viewService.getViewType() === 'mobile') {
      let body = document.getElementsByTagName('body')[0];
      body.classList.contains('mini-navbar') ? body.classList.remove('mini-navbar') : body.classList.add('mini-navbar');
    }
  }

  public toggleNav() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.contains('mini-navbar') ? body.classList.remove('mini-navbar') : body.classList.add('mini-navbar');
  }

  public logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

} // end of  class
