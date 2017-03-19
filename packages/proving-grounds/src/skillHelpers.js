// @flow
import {
  compose,
  find,
  head,
  join,
  juxt,
  map,
  match,
  propEq,
  tail,
  test,
  toUpper,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type { Skill } from 'fire-emblem-heroes-stats';

// $FlowIssue flow thinks this will return an Array
export const getSkillInfo = (skillName: string) : Skill =>
    find(propEq('name', skillName), stats.skills);

const capitalize = compose(join(''), juxt([compose(toUpper, head), tail]))

// Returns the value for a stat provided by a passive skill
export function getStatValue(skillName: string, statKey: string, isAttacker: boolean) {
  const skill = getSkillInfo(skillName);
  if (skill.type != 'PASSIVE_A') return 0;
  const statRegex = new RegExp(statKey == 'hp' ? 'max HP' : capitalize(statKey));
  if (test(statRegex, skill.effect)) {
    const skillNumbers = map(parseInt, match(/\d+/g, skill.effect));
    // Atk/Def/Spd/Res/HP+ and Fury
    if (test(/(Fury|\+)/, skillName)) {
      return skillNumbers[0];
    }
    // Death/Darting/Armored/Warding Blow
    if (isAttacker && test(/Blow/, skillName)) {
      return skillNumbers[0];
    }
    if (test(/Life and Death/, skillName)) {
      if (statKey == 'atk' || statKey == 'spd') {
        return skillNumbers[0];
      } else if (statKey == 'def' || statKey == 'res') {
        return -skillNumbers[1];
      }
    }
  }
  return 0;
}