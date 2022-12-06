import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-datastream-buffer-visualizer',
  templateUrl: './datastream-buffer-visualizer.component.html',
  styleUrls: ['./datastream-buffer-visualizer.component.scss'],
})
export class DatastreamBufferVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  message: string[] = [];
  index: number = 0;
  packetLength: number = 0;
  ngOnInit(): void {
    this.message = (this.data.message as string).split('');
    this.index = this.data.index as number;
    this.packetLength = this.data.packetLength as number;
  }

  isInPacket(idx: number): boolean {
    return idx > this.index - this.packetLength && idx <= this.index;
  }
}
