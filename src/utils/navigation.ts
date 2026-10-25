import { METRO_LINES, METRO_STATIONS, TASHKENT_METRO_STATS } from '../data/metroData';
import { CrowdLevel, MetroStation, RouteResult, RouteStep } from '../types/metro';

interface GraphEdge {
  toStationId: string;
  lineId: string;
  weight: number; // minutes
  isTransfer: boolean;
}

// Build adjacency list for Tashkent Metro graph
function buildMetroGraph(): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();

  // Initialize nodes
  Object.keys(METRO_STATIONS).forEach(id => {
    graph.set(id, []);
  });

  // Add line connections
  Object.values(METRO_LINES).forEach(line => {
    const stIds = line.stations;
    for (let i = 0; i < stIds.length - 1; i++) {
      const u = stIds[i];
      const v = stIds[i + 1];

      // Time between consecutive stations is roughly 2.3 - 2.8 minutes
      const travelTime = 2.5;

      graph.get(u)?.push({
        toStationId: v,
        lineId: line.id,
        weight: travelTime,
        isTransfer: false,
      });

      graph.get(v)?.push({
        toStationId: u,
        lineId: line.id,
        weight: travelTime,
        isTransfer: false,
      });
    }
  });

  // Add interchange connections
  Object.values(METRO_STATIONS).forEach(station => {
    if (station.interchanges) {
      station.interchanges.forEach(interchange => {
        // Transfer walking time + wait penalty
        const transferTime = interchange.walkMinutes + 1.5;
        graph.get(station.id)?.push({
          toStationId: interchange.stationId,
          lineId: interchange.lineId,
          weight: transferTime,
          isTransfer: true,
        });
      });
    }
  });

  return graph;
}

const metroGraph = buildMetroGraph();

export function findBestRoute(fromStationId: string, toStationId: string): RouteResult | null {
  if (!METRO_STATIONS[fromStationId] || !METRO_STATIONS[toStationId]) {
    return null;
  }

  if (fromStationId === toStationId) {
    const station = METRO_STATIONS[fromStationId];
    return {
      fromStation: station,
      toStation: station,
      totalDurationMinutes: 0,
      totalStations: 0,
      transferCount: 0,
      steps: [],
      fareUzs: {
        atto: TASHKENT_METRO_STATS.fareAtto,
        standard: TASHKENT_METRO_STATS.fareStandard,
        discount: TASHKENT_METRO_STATS.fareDiscount,
      },
    };
  }

  // Dijkstra's algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, { stationId: string; lineId: string; isTransfer: boolean }>();
  const unvisited = new Set<string>();

  Object.keys(METRO_STATIONS).forEach(id => {
    distances.set(id, Infinity);
    unvisited.add(id);
  });

  distances.set(fromStationId, 0);

  while (unvisited.size > 0) {
    // Find unvisited station with minimum distance
    let currentStationId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach(id => {
      const dist = distances.get(id) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        currentStationId = id;
      }
    });

    if (currentStationId === null || minDistance === Infinity) {
      break;
    }

    if (currentStationId === toStationId) {
      break; // Reached destination
    }

    unvisited.delete(currentStationId);

    const neighbors = metroGraph.get(currentStationId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.toStationId)) continue;

      const alt = minDistance + edge.weight;
      if (alt < (distances.get(edge.toStationId) ?? Infinity)) {
        distances.set(edge.toStationId, alt);
        previous.set(edge.toStationId, {
          stationId: currentStationId,
          lineId: edge.lineId,
          isTransfer: edge.isTransfer,
        });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | undefined = toStationId;

  while (curr) {
    path.unshift(curr);
    if (curr === fromStationId) break;
    const prev = previous.get(curr);
    curr = prev?.stationId;
  }

  if (path[0] !== fromStationId) {
    return null; // No route found
  }

  // Break path into logical RouteSteps (travel chunks and transfer chunks)
  const steps: RouteStep[] = [];
  let transferCount = 0;
  let currentLegStations: string[] = [path[0]];
  let currentLegLine = METRO_STATIONS[path[0]].lineId;

  for (let i = 1; i < path.length; i++) {
    const prevSt = METRO_STATIONS[path[i - 1]];
    const currSt = METRO_STATIONS[path[i]];
    const prevInfo = previous.get(path[i]);

    if (prevInfo?.isTransfer) {
      // Finish previous travel leg if it has more than 1 station
      if (currentLegStations.length > 1) {
        const fromSt = METRO_STATIONS[currentLegStations[0]];
        const toSt = METRO_STATIONS[currentLegStations[currentLegStations.length - 1]];
        const line = METRO_LINES[fromSt.lineId];
        const minutes = Math.round((currentLegStations.length - 1) * 2.5);

        steps.push({
          type: 'travel',
          lineId: fromSt.lineId,
          fromStationId: fromSt.id,
          toStationId: toSt.id,
          stationsPassed: [...currentLegStations],
          durationMinutes: minutes,
          instruction: {
            uz: `${line.name.uz} bo'ylab "${toSt.name.uz}" bekatigacha boring (${currentLegStations.length - 1} ta bekat)`,
            ru: `Поезжайте по ${line.name.ru} до станции «${toSt.name.ru}» (${currentLegStations.length - 1} ст.)`,
            en: `Take the ${line.name.en} to "${toSt.name.en}" station (${currentLegStations.length - 1} stops)`,
          },
        });
      }

      // Add transfer step
      transferCount++;
      const targetLine = METRO_LINES[currSt.lineId];
      steps.push({
        type: 'transfer',
        lineId: currSt.lineId,
        fromStationId: prevSt.id,
        toStationId: currSt.id,
        stationsPassed: [prevSt.id, currSt.id],
        durationMinutes: 2,
        instruction: {
          uz: `"${prevSt.name.uz}" bekatida ${targetLine.name.uz}ning "${currSt.name.uz}" bekatiga piyoda o'ting (2 daqiqa)`,
          ru: `Перейдите со станции «${prevSt.name.ru}» на «${currSt.name.ru}» (${targetLine.name.ru})`,
          en: `Transfer from "${prevSt.name.en}" to "${currSt.name.en}" (${targetLine.name.en}) via walkway`,
        },
      });

      currentLegStations = [currSt.id];
      currentLegLine = currSt.lineId;
    } else {
      currentLegStations.push(currSt.id);
    }
  }

  // Finish last travel leg
  if (currentLegStations.length > 1) {
    const fromSt = METRO_STATIONS[currentLegStations[0]];
    const toSt = METRO_STATIONS[currentLegStations[currentLegStations.length - 1]];
    const line = METRO_LINES[currentLegLine];
    const minutes = Math.round((currentLegStations.length - 1) * 2.5);

    steps.push({
      type: 'travel',
      lineId: currentLegLine,
      fromStationId: fromSt.id,
      toStationId: toSt.id,
      stationsPassed: [...currentLegStations],
      durationMinutes: minutes,
      instruction: {
        uz: `${line.name.uz} bo'ylab "${toSt.name.uz}" bekatigacha boring (${currentLegStations.length - 1} ta bekat)`,
        ru: `Поезжайте по ${line.name.ru} до станции «${toSt.name.ru}» (${currentLegStations.length - 1} ст.)`,
        en: `Take the ${line.name.en} to "${toSt.name.en}" (${currentLegStations.length - 1} stops)`,
      },
    });
  }

  const totalDuration = steps.reduce((acc, step) => acc + step.durationMinutes, 0);

  return {
    fromStation: METRO_STATIONS[fromStationId],
    toStation: METRO_STATIONS[toStationId],
    totalDurationMinutes: totalDuration,
    totalStations: path.length,
    transferCount,
    steps,
    fareUzs: {
      atto: TASHKENT_METRO_STATS.fareAtto,
      standard: TASHKENT_METRO_STATS.fareStandard,
      discount: TASHKENT_METRO_STATS.fareDiscount,
    },
  };
}

// Haversine formula to compute distance in meters between user GPS and station
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function findNearestStation(lat: number, lng: number): { station: MetroStation; distanceMeters: number } {
  let closestStation: MetroStation = Object.values(METRO_STATIONS)[0];
  let minDistance = Infinity;

  Object.values(METRO_STATIONS).forEach(station => {
    const dist = getDistanceMeters(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestStation = station;
    }
  });

  return {
    station: closestStation,
    distanceMeters: minDistance,
  };
}

// Next train calculation: pseudo-realtime deterministic ticking simulation
export function calculateNextTrainTimes(stationId: string, currentTimestamp: number = Date.now()) {
  const station = METRO_STATIONS[stationId];
  if (!station) {
    return {
      dir1: { dest: 'Bosh bekat', minutes: 2, seconds: 40 },
      dir2: { dest: 'Oxirgi bekat', minutes: 4, seconds: 15 },
    };
  }

  // Interval duration depends on time of day
  const date = new Date(currentTimestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const isPeak = (hour >= 7 && hour < 10) || (hour >= 17 && hour < 20);
  const intervalSeconds = isPeak ? 180 : 300; // 3 min in peak, 5 min off-peak

  // Deterministic offset based on station order & line
  const stationOffset = (station.order * 73) % intervalSeconds;
  const currentSecondOfDay = (minutes * 60 + seconds) % intervalSeconds;

  let remainingSeconds1 = (intervalSeconds - ((currentSecondOfDay + stationOffset) % intervalSeconds)) % intervalSeconds;
  if (remainingSeconds1 === 0) remainingSeconds1 = intervalSeconds;

  let remainingSeconds2 = (intervalSeconds - ((currentSecondOfDay + stationOffset + 90) % intervalSeconds)) % intervalSeconds;
  if (remainingSeconds2 === 0) remainingSeconds2 = intervalSeconds;

  return {
    dir1: {
      dest: station.directions.dir1,
      minutes: Math.floor(remainingSeconds1 / 60),
      seconds: remainingSeconds1 % 60,
    },
    dir2: {
      dest: station.directions.dir2,
      minutes: Math.floor(remainingSeconds2 / 60),
      seconds: remainingSeconds2 % 60,
    },
  };
}

export function getCrowdLevel(date: Date = new Date()): {
  level: CrowdLevel;
  label: { uz: string; ru: string; en: string };
  badgeColor: string;
  tip: { uz: string; ru: string; en: string };
} {
  const hour = date.getHours();

  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return {
      level: 'high',
      label: { uz: 'Hozir gavjum', ru: 'Высокая загруженность', en: 'High Crowding' },
      badgeColor: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      tip: {
        uz: 'Tig\'iz soat: platformalarda odam ko\'p. Poyezdlar har 2.5-3 daqiqada qatnamoqda.',
        ru: 'Час пик: на станциях плотный пассажиропоток. Интервал движения 2.5–3 минуты.',
        en: 'Peak hours: busy platforms. Trains run every 2.5–3 minutes.',
      },
    };
  }

  if (hour >= 10 && hour <= 16) {
    return {
      level: 'moderate',
      label: { uz: 'Hozir o\'rtacha', ru: 'Умеренная загруженность', en: 'Moderate' },
      badgeColor: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      tip: {
        uz: 'Kunduzgi qatnov: erkin o\'rindiqlar mavjud, qatnov oraliq vaqti 4-5 daqiqa.',
        ru: 'Дневное время: умеренный поток, есть свободные места. Интервал 4–5 минут.',
        en: 'Daytime flow: comfortable seats available, trains run every 4–5 minutes.',
      },
    };
  }

  return {
    level: 'low',
    label: { uz: 'Hozir bo\'sh / erkin', ru: 'Свободно', en: 'Low / Comfortable' },
    badgeColor: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    tip: {
      uz: 'Sokin va qulay vaqt: vagonlarda erkin harakatlanish imkoniyati.',
      ru: 'Тихий период: свободные вагоны и спокойная поездка.',
      en: 'Quiet off-peak hours: peaceful ride with plenty of seats.',
    },
  };
}
