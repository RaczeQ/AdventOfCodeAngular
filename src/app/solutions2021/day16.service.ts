import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { BitsVisualizerComponent } from './components/bits-visualizer/bits-visualizer.component';

export interface Packet {
  version: number;
  typeId: number;
  lengthId?: number;
  value: number;
  subPackets: Packet[];
  packetSize: number;
  lengthNumber?: number;
  packetBits?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Day16Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 16, 'Packet Decoder');
  }

  private convertToBinary(packets: string): string {
    var result = '';
    packets.split('').forEach((c) => {
      result += parseInt(c, 16).toString(2).padStart(4, '0');
    });
    return result;
  }

  private generatePackets(bits: string, currentIdx: number): Packet {
    var startIdx = currentIdx;
    var result: Packet | null;
    var finished = false;
    while (!finished || currentIdx > bits.length) {
      var version = Number.parseInt(bits.slice(currentIdx, currentIdx + 3), 2);
      var typeId = Number.parseInt(
        bits.slice(currentIdx + 3, currentIdx + 6),
        2
      );
      currentIdx += 6;
      result = {
        version: version,
        typeId: typeId,
        packetSize: 0,
        value: 0,
        subPackets: [],
      };
      if (typeId == 4) {
        var lastPacket = false;
        var binaryNumber = '';
        while (!lastPacket) {
          if (bits[currentIdx] == '0') {
            lastPacket = true;
          }
          binaryNumber += bits.slice(currentIdx + 1, currentIdx + 5);
          currentIdx += 5;
        }
        result.value = Number.parseInt(binaryNumber, 2);
        finished = true;
      } else {
        result.lengthId = Number.parseInt(
          bits.slice(currentIdx, currentIdx + 1),
          2
        );
        currentIdx++;
        if (result.lengthId == 0) {
          var bitsNumber = Number.parseInt(
            bits.slice(currentIdx, currentIdx + 15),
            2
          );
          result.lengthNumber = bitsNumber;
          currentIdx += 15;
          var finishIdx = currentIdx + bitsNumber;
          while (currentIdx < finishIdx) {
            var subPacket = this.generatePackets(bits, currentIdx);
            result.subPackets.push(subPacket);
            currentIdx += subPacket.packetSize;
          }
        } else {
          var packetsNumber = Number.parseInt(
            bits.slice(currentIdx, currentIdx + 11),
            2
          );
          result.lengthNumber = packetsNumber;
          currentIdx += 11;
          for (let index = 0; index < packetsNumber; index++) {
            var subPacket = this.generatePackets(bits, currentIdx);
            result.subPackets.push(subPacket);
            currentIdx += subPacket.packetSize;
          }
        }
        switch (result.typeId) {
          case 0:
            result.value =
              result.subPackets.length > 1
                ? result.subPackets.map((p) => p.value).reduce((a, b) => a + b)
                : result.subPackets[0].value;
            break;
          case 1:
            result.value =
              result.subPackets.length > 1
                ? result.subPackets.map((p) => p.value).reduce((a, b) => a * b)
                : result.subPackets[0].value;
            break;
          case 2:
            result.value = Math.min(...result.subPackets.map((p) => p.value));
            break;
          case 3:
            result.value = Math.max(...result.subPackets.map((p) => p.value));
            break;
          case 5:
            result.value =
              result.subPackets[0].value > result.subPackets[1].value ? 1 : 0;
            break;
          case 6:
            result.value =
              result.subPackets[0].value < result.subPackets[1].value ? 1 : 0;
            break;
          case 7:
            result.value =
              result.subPackets[0].value == result.subPackets[1].value ? 1 : 0;
            break;
        }
        finished = true;
      }
    }
    result!.packetSize = currentIdx - startIdx;
    result!.packetBits = bits.slice(startIdx, currentIdx);
    return result!;
  }

  private sumVersions(packet: Packet): number {
    return (
      packet.version +
      (packet.subPackets.length > 0
        ? packet.subPackets
            .map((p) => this.sumVersions(p))
            .reduce((a, b) => a + b)
        : 0)
    );
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var binaryLine = this.convertToBinary(lines[0]);
    var packet = this.generatePackets(binaryLine, 0);
    return {
      result: this.sumVersions(packet),
      component: BitsVisualizerComponent,
      componentData: {
        packet: packet,
        showValues: false,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var binaryLine = this.convertToBinary(lines[0]);
    var packet = this.generatePackets(binaryLine, 0);
    return {
      result: packet.value,
      component: BitsVisualizerComponent,
      componentData: {
        packet: packet,
        showValues: true,
      },
    };
  }
}
