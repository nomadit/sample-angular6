import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { AuthService } from '../../providers/auth.service';
import { ChangeViewService } from '../../providers/change.view.service';

@Component({
  selector: 'app-body',
  templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {
  public isFactoryInMonitoring: boolean;
  public isOnSupportPage: boolean;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private auth: AuthService,
              private viewService: ChangeViewService) {
  }

  public ngOnInit() {
    this.setIsFactoryInMonitoring();
    this.setIframeClassForSupportPage();
  }

  public getClass() {
    // Check device & browser type
    return this.viewService.getViewType();
  }

// jeKim -180727
  public setIsFactoryInMonitoring() {
    this.isFactoryInMonitoring = false;
    if (this.router.url.indexOf('monitoring') < 0) {
      return;
    }
    if (this.router.url.indexOf('monitoring/admin') < 0) {
      this.isFactoryInMonitoring = this.auth.getInfo().role === 'FACTORY';
    } else {
      if (this.auth.getInfo().role !== 'ADMIN') {
        return;
      }
      this.route.paramMap.subscribe((params) => {
        const id = +params.get('id');
        if (id > 0) {
          this.auth.getSubstitute(id).subscribe(info => {
            this.isFactoryInMonitoring = info.role === 'FACTORY';
          });
        }
      });
    }
  }

  public setIframeClassForSupportPage() {
    const supportUrls: any[] = ['/faq', '/notice', '/support-management'];
    if(supportUrls.indexOf(this.router.url) > -1) {
      this.isOnSupportPage = true;
    }
  }
}
