import Vue from 'vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import locale from '@/locale';

function getTimeUnits(type = locale.locale): [string, string] {
  switch (type) {
    case 'zh-CN': return ['小时', '分钟'];
    case 'zh-TW': ['小時', '分鐘'];
    default: ['hr', 'min'];
  }
}

export function formatTime(Milliseconds, format = 'HH:MM:SS') {
  if (!Milliseconds) return '';
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  const time = dayjs.duration(Milliseconds);
  const hours = time.hours().toString();
  const mins = time.minutes().toString();
  const seconds = time.seconds().toString().padStart(2, '0');

  if (format === 'HH:MM:SS') {
    return hours !== '0'
      ? `${hours}:${mins.padStart(2, '0')}:${seconds}`
      : `${mins}:${seconds}`;
  } else if (format === 'Human') {
    const [hoursUnit, minitesUnit] = getTimeUnits();
    return hours !== '0'
      ? `${hours} ${hoursUnit} ${mins} ${minitesUnit}`
      : `${mins} ${minitesUnit}`;
  }
}

export function formatDate(timestamp?: number, format = 'MMM D, YYYY') {
  if (!timestamp) return '';
  if (locale.locale === 'zh-CN') format = 'YYYY年MM月DD日';
  else if (locale.locale === 'zh-TW') format = 'YYYY年MM月DD日';
  return dayjs(timestamp).format(format);
}

export function formatAlbumType(type, album) {
  if (!type) return '';
  if (type === 'EP/Single') {
    return album.size === 1 ? 'Single' : 'EP';
  } else if (type === 'Single') {
    return 'Single';
  } else if (type === '专辑') {
    return 'Album';
  } else {
    return type;
  }
}

export function resizeImage(imgUrl?: string, size = 512) {
  if (!imgUrl) return '';
  let httpsImgUrl = imgUrl;
  if (imgUrl.slice(0, 5) !== 'https') {
    httpsImgUrl = 'https' + imgUrl.slice(4);
  }
  return `${httpsImgUrl}?param=${size}y${size}`;
}

export function formatPlayCount(count?: number) {
  if (!count) return '';
  if (locale.locale === 'zh-CN') {
    if (count > 100000000) {
      return `${Math.floor((count / 100000000) * 100) / 100}亿`; // 2.32 亿
    }
    if (count > 100000) {
      return `${Math.floor((count / 10000) * 10) / 10}万`; // 232.1 万
    }
    if (count > 10000) {
      return `${Math.floor((count / 10000) * 100) / 100}万`; // 2.3 万
    }
    return count;
  } else if (locale.locale === 'zh-TW') {
    if (count > 100000000) {
      return `${Math.floor((count / 100000000) * 100) / 100}億`; // 2.32 億
    }
    if (count > 100000) {
      return `${Math.floor((count / 10000) * 10) / 10}萬`; // 232.1 萬
    }
    if (count > 10000) {
      return `${Math.floor((count / 10000) * 100) / 100}萬`; // 2.3 萬
    }
    return count;
  } else {
    if (count > 10000000) {
      return `${Math.floor((count / 1000000) * 10) / 10}M`; // 233.2M
    }
    if (count > 1000000) {
      return `${Math.floor((count / 1000000) * 100) / 100}M`; // 2.3M
    }
    if (count > 1000) {
      return `${Math.floor((count / 1000) * 100) / 100}K`; // 233.23K
    }
    return count;
  }
}

export function toHttps(url: string) {
  if (!url) return '';
  return url.replace(/^http:/, 'https:');
}
