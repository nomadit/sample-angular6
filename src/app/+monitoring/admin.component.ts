import {
  Component, ComponentFactoryResolver, OnChanges, OnInit, ReflectiveInjector, SimpleChanges, ValueProvider, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryComponent } from './factory/pc/component';
import { WholesaleComponent } from './customer/wholesale/pc/component';
import { RetailComponent } from './customer/retail/pc/component';
import { UserService } from '../providers/user.service';

@Component({
  selector: 'app-monitoring',
  template: `
    <div #dynamicComponentContainer></div>
  `,
  styleUrls: ['./component.css', '../../assets/css/iCheck/custom.css'],
})
export class AdminMonitoringComponent implements OnInit, OnChanges {
  public currentComponent:any = null;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;

  constructor(private auth: AuthService,
              private user: UserService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private route: ActivatedRoute,
              private router: Router) {
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = +params.get('id');
      if (this.auth.getAdminInfo()) {
        this.auth.getSubstitute(id).subscribe(info => {
          this.loadComponent(info.role)
        });
      }
    });
    this.runAdminInfoExpire()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.auth.delayAdminExpire();
  }

  public loadComponent(role:string) {

    let componentFactory;
    switch (role) {
      case 'FACTORY': {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(FactoryComponent);
        break;
      }
      case 'WHOLESALE': {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(WholesaleComponent);
        break;
      }
      case 'RETAIL': {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(RetailComponent);
        break;
      }
      default: {
        this.auth.logout();
        this.router.navigate(['/login']);
        return;
      }
    }

    // Inputs need to be in the following format to be resolved properly
    const param: ValueProvider = {provide: 'role', useValue: role};
    let resolvedInputs = ReflectiveInjector.resolve([param]);

    // We create an injector out of the data we want to pass down and this components injector
    let injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.dynamicComponentContainer.parentInjector);

    // We create the component using the factory and the injector
    let component = componentFactory.create(injector);

    // We insert the component into the dom container
    this.dynamicComponentContainer.insert(component.hostView);

    // We can destroy the old component is we like by calling destroy
    if (this.currentComponent) {
      this.currentComponent.destroy();
    }

    this.currentComponent = component;
  }

  private runAdminInfoExpire() {
    const timer = setInterval(() => {
      if (this.auth.isAdminExpire()) {
        clearInterval(timer);
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    }, 1000 * 60 * 60);
  }

}
