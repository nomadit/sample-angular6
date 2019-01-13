import {
  Component, ComponentFactoryResolver, OnInit, ReflectiveInjector, ValueProvider, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { AdminComponent } from './admin/component';
import { FactoryComponent } from './factory/pc/component';
import { WholesaleComponent } from './customer/wholesale/pc/component';
import { RetailComponent } from './customer/retail/pc/component';
import { ChangeViewService } from '../providers/change.view.service';

@Component({
  selector: 'app-monitoring',
  template: `
    <div #dynamicComponentContainer></div>
  `,
  styleUrls: ['./component.css', '../../assets/css/iCheck/custom.css'],
})
export class MonitoringComponent implements OnInit {
  public currentComponent:any = null;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;

  constructor(private auth: AuthService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private router: Router,
              private viewService: ChangeViewService) {
  }

  public ngOnInit() {
    this.loadComponent();
  }

  public loadComponent() {
    const currentRole = this.auth.getInfo().role;

    let componentFactory;
    switch (currentRole) {
      case 'ADMIN': {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(AdminComponent);
        break;
      }
      case 'FACTORY': {
        if (this.viewService.getViewType() === 'mobile') {
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(FactoryComponent);
          // componentFactory = this.componentFactoryResolver.resolveComponentFactory(FactoryMobileComponent);
        } else {
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(FactoryComponent);
        }
        break;
      }
      case 'WHOLESALE': {
        if (this.viewService.getViewType() === 'mobile') {
          // componentFactory = this.componentFactoryResolver.resolveComponentFactory(WholesaleMobileComponent);
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(WholesaleComponent);
        } else {
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(WholesaleComponent);
        }
        break;
      }
      case 'RETAIL': {
        if (this.viewService.getViewType() === 'mobile') {
          // componentFactory = this.componentFactoryResolver.resolveComponentFactory(RetailMobileComponent);
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(RetailComponent);
        } else {
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(RetailComponent);
        }
        break;
      }
      default: {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    }

    // Inputs need to be in the following format to be resolved properly
    const param: ValueProvider = {provide: 'role', useValue: currentRole};
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
}
