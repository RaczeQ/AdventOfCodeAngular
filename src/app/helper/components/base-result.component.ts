import { Directive, Input } from "@angular/core";

@Directive()
export abstract class BaseResultComponent {
  @Input() data: any;
}
