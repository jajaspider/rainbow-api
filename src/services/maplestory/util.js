const _ = require("lodash");

function cooldown(cooldown, mercedes, hat) {
  let unionCooldown = 0;
  let hatCooldown = hat;

  if (mercedes == "sss") {
    unionCooldown = 0.06;
  } else if (mercedes == "ss") {
    unionCooldown = 0.05;
  } else if (mercedes == "s") {
    unionCooldown = 0.04;
  } else if (mercedes == "a") {
    unionCooldown = 0.03;
  } else if (mercedes == "b") {
    unionCooldown = 0.02;
  }

  // unionCooldown의 소숫점 2자리로인한 부동 소수점 계산
  cooldown = (cooldown * (100 - unionCooldown * 100)) / 100;
  // 유니온으로 인한 쿨타임은 1초까지 적용
  if (cooldown <= 1) {
    return 1;
  }

  // 유니온 적용 후 쿨타임이 5초 미만일 경우 - 쿨뚝은 적용되지않음
  if (cooldown <= 5) {
    return cooldown;
  }

  // 유니온 적용 후 쿨타임이 10초 초과인 경우
  if (cooldown > 10) {
    // 10초까지 만드는데 더 깎아야할 쿨타임 / 부동 소수점 방지로 인한 *100배수
    let cooldownLeft = (cooldown * 100 - 1000) / 100;

    // 만약 모자 쿨감이 남은 쿨타임보다 작으면 상관없음 / 부동 소수점 방지로 인한 * 100배수
    if (hatCooldown < cooldownLeft) {
      return (cooldown * 100 - hat * 100) / 100;
    } else {
      cooldown -= cooldownLeft;
      // 부동 소수점 방지로 인한 * 100배수
      hatCooldown = (hatCooldown * 100 - cooldownLeft * 100) / 100;
    }
  }

  // 여기부터는 10초 이하인 쿨타임 계산

  // 모자 쿨타임은 10초미만으로 갈때 0.05 적용, 부동소숫점 계산들 포함
  cooldown = (cooldown * ((1 - (5 * hatCooldown * 100) / 10000) * 1000)) / 1000;

  if (cooldown <= 5) {
    return 5;
  }

  return cooldown;
}

module.exports = { cooldown };
