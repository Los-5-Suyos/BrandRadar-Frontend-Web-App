import { SentimentLabelPipe } from './sentiment-label-pipe';

describe('SentimentLabelPipe', () => {
  it('create an instance', () => {
    const pipe = new SentimentLabelPipe();
    expect(pipe).toBeTruthy();
  });
});
