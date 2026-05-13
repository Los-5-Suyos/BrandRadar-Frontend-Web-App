import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sentimentLabel',
})
export class SentimentLabelPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
