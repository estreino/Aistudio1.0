/**
 * Motor de cálculo de duração de sono com tratamento rigoroso para períodos que cruzam a meia-noite.
 */

export interface SleepDurationCalculation {
  durationMinutes: number;
  hours: number;
  minutes: number;
  formattedText: string;
  crossesMidnight: boolean;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calcula a duração exata de sono em minutos e formato amigável.
 * Se bedTime for, por exemplo, 23:30 e wakeTime for 07:15, o cálculo
 * adiciona 24 horas ao horário de despertar, resultando em 465 minutos (7h 45m).
 */
export function calculateSleepDurationFromTimes(
  bedTimeStr: string, // formato "HH:mm" (ex: "23:30")
  wakeTimeStr: string // formato "HH:mm" (ex: "07:15")
): SleepDurationCalculation {
  const [bedH, bedM] = bedTimeStr.split(':').map((n) => parseInt(n, 10));
  const [wakeH, wakeM] = wakeTimeStr.split(':').map((n) => parseInt(n, 10));

  if (isNaN(bedH) || isNaN(bedM) || isNaN(wakeH) || isNaN(wakeM)) {
    return {
      durationMinutes: 0,
      hours: 0,
      minutes: 0,
      formattedText: 'Horário inválido',
      crossesMidnight: false,
      isValid: false,
      errorMessage: 'Formato de horário inválido.',
    };
  }

  const bedTotalMinutes = bedH * 60 + bedM;
  const wakeTotalMinutes = wakeH * 60 + wakeM;

  let diffMinutes = wakeTotalMinutes - bedTotalMinutes;
  let crossesMidnight = false;

  // Se o horário de despertar for menor ou igual ao horário de deitar, cruzou a meia-noite
  if (diffMinutes <= 0) {
    diffMinutes += 24 * 60; // Soma 1440 minutos (24 horas)
    crossesMidnight = true;
  }

  // Se os horários forem rigorosamente idênticos, consideramos zero/inválido
  if (bedTimeStr === wakeTimeStr) {
    return {
      durationMinutes: 0,
      hours: 0,
      minutes: 0,
      formattedText: '0h 00m',
      crossesMidnight: false,
      isValid: false,
      errorMessage: 'Horário de deitar e despertar não podem ser idênticos.',
    };
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const formattedText = `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`;

  return {
    durationMinutes: diffMinutes,
    hours,
    minutes,
    formattedText,
    crossesMidnight,
    isValid: true,
  };
}

/**
 * Calcula a duração de sono a partir de strings completas ISO 8601.
 */
export function calculateSleepDurationFromIso(
  bedTimeIso: string,
  wakeTimeIso: string
): SleepDurationCalculation {
  const bedDate = new Date(bedTimeIso);
  const wakeDate = new Date(wakeTimeIso);

  if (isNaN(bedDate.getTime()) || isNaN(wakeDate.getTime())) {
    return {
      durationMinutes: 0,
      hours: 0,
      minutes: 0,
      formattedText: 'Data inválida',
      crossesMidnight: false,
      isValid: false,
      errorMessage: 'Data em formato ISO inválido.',
    };
  }

  let diffMs = wakeDate.getTime() - bedDate.getTime();

  // Se a data de despertar for cronologicamente anterior, ajusta com 24h
  if (diffMs <= 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const formattedText = `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`;

  return {
    durationMinutes: diffMinutes,
    hours,
    minutes,
    formattedText,
    crossesMidnight: bedDate.getDate() !== wakeDate.getDate(),
    isValid: true,
  };
}
