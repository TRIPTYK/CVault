import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class RelativeTimeHelper extends Helper {
  @service declare intl: IntlService;

  compute([value]: [string]) {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();

    const diffInSeconds = Math.floor(
      (date.getTime() - now.getTime()) / 1000
    );

    const abs = Math.abs(diffInSeconds);

    let unit: Intl.RelativeTimeFormatUnit;
    let amount: number;

    if (abs < 60) {
      unit = 'second';
      amount = diffInSeconds;
    } else if (abs < 3600) {
      unit = 'minute';
      amount = Math.floor(diffInSeconds / 60);
    } else if (abs < 86400) {
      unit = 'hour';
      amount = Math.floor(diffInSeconds / 3600);
    } else {
      unit = 'day';
      amount = Math.floor(diffInSeconds / 86400);
    }

    const formatter = new Intl.RelativeTimeFormat(
      this.intl.locales,
      { numeric: 'auto' }
    );

    return formatter.format(amount, unit);
  }
}