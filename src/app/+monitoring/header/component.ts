import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../providers/auth.service';

@Component({
  selector: 'app-monitoring-header',
  templateUrl: './component.html',
})
export class HeaderComponent implements OnInit {
  public loginID: string = '';

  constructor(private auth: AuthService) {}
  ngOnInit(): void {
    if (this.auth.hasSubstitution()) {
      this.auth.getInfoForMonitoring().subscribe(info => {
        this.loginID = '(' + info.login_id + ')';
      })
    }
  }
}
