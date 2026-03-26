import { getContext } from './text-conext';

describe('textContext', () => {

  it('should be extract textContext and do not overflow string index', () => {
    const prefix = 'prefix ';
    const suffix = ' suffix';
    const search = 'text';
    const text = prefix + search + suffix;

    const start = text.indexOf(search);
    const end = start + search.length;

    const result = getContext(text, start, end);
    expect(result.prefix).toBe(prefix);
    expect(result.suffix).toBe(suffix);
  });


  it('should be extract textContext and do not exceed getContext length', () => {
    const prefix = '1234567890';
    const suffix = '0987654321';
    const search = 'text';
    const text = 'fjdslk' + prefix + search + suffix + 'jfdklsfjdkls';

    const start = text.indexOf(search);
    const end = start + search.length;

    const result = getContext(text, start, end);
    expect(result.prefix).toBe(prefix);
    expect(result.suffix).toBe(suffix);
  });
});
