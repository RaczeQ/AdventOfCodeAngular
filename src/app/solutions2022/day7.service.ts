import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { DeviceFileVisualizerComponent } from './components/device-file-visualizer/device-file-visualizer.component';

export interface DeviceFile {
  isDirectory: boolean;
  fileName: string;
  fileSize: number;
  subFiles: DeviceFile[];
  parentFile?: DeviceFile;
}

function buildDeviceFileTree(input: string): DeviceFile {
  var rootFile: DeviceFile = {
    fileName: '/',
    fileSize: 0,
    isDirectory: true,
    subFiles: [],
  };
  var currentFile = rootFile;

  splitIntoLines(input).forEach((line) => {
    if (line.startsWith('$')) {
      var commandParts = line.split(' ');
      if (commandParts[1] === 'cd') {
        switch (commandParts[2]) {
          case '/':
            currentFile = rootFile;
            break;
          case '..':
            currentFile = currentFile.parentFile!;
            break;
          default:
            currentFile = currentFile.subFiles.find(
              (f) => f.fileName === commandParts[2]
            )!;
        }
      }
    } else {
      var outputParts = line.split(' ');
      var isDirectory = outputParts[0] == 'dir';
      var newFile: DeviceFile = {
        fileName: outputParts[1],
        fileSize: isDirectory ? 0 : Number(outputParts[0]),
        isDirectory: isDirectory,
        subFiles: [],
        parentFile: currentFile,
      };
      currentFile.subFiles.push(newFile);
    }
  });

  return rootFile;
}

function totalDirectorySize(file: DeviceFile): number {
  return file.isDirectory
    ? file.subFiles.map((f) => totalDirectorySize(f)).sum()
    : file.fileSize;
}

function getAllDirectories(file: DeviceFile): DeviceFile[] {
  return file.subFiles
    .filter((f) => f.isDirectory)
    .concat(file.subFiles.flatMap((f) => getAllDirectories(f)));
}

@Injectable({
  providedIn: 'root',
})
export class Day7Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 7, 'No Space Left On Device');
  }
  override solvePart1(input: string): PuzzleResult {
    var rootFile = buildDeviceFileTree(input);
    var directorySizes = [rootFile]
      .concat(getAllDirectories(rootFile))
      .map((dir) => {
        return { dir, size: totalDirectorySize(dir) };
      });

    directorySizes.forEach(({ dir, size }) => (dir.fileSize = size));

    var filteredDirectorySizes = directorySizes.filter(
      ({ dir, size }) => size < 100000
    );
    return {
      result: filteredDirectorySizes.map(({ dir, size }) => size).sum(),
      component: DeviceFileVisualizerComponent,
      componentData: {
        file: rootFile,
        selectedDirectories: filteredDirectorySizes.map(({ dir, size }) => dir),
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var totalDiskSize = 70000000;
    var requiredDiskSize = 30000000;
    var rootFile = buildDeviceFileTree(input);
    var rootSize = totalDirectorySize(rootFile);
    rootFile.fileSize = rootSize;
    var currentFreeSize = totalDiskSize - rootSize;
    var requiredFreeSize = requiredDiskSize - currentFreeSize;

    var directorySizes = getAllDirectories(rootFile).map((dir) => {
      return { dir, size: totalDirectorySize(dir) };
    });

    directorySizes.forEach(({ dir, size }) => (dir.fileSize = size));

    var filteredDirectorySizes = directorySizes
      .filter(({ dir, size }) => size >= requiredFreeSize)
      .sort((a, b) => a.size - b.size);
    return {
      result: filteredDirectorySizes[0].size,
      component: DeviceFileVisualizerComponent,
      componentData: {
        file: rootFile,
        selectedDirectories: [filteredDirectorySizes[0].dir],
      },
    };
  }
}
