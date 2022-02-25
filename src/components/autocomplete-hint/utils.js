export function mergeRefs(...refs) {
    const filteredRefs = refs.filter(Boolean);

    return (inst) => {
        for (let ref of filteredRefs) {
            if (typeof ref === 'function') {
                ref(inst);
            } else if (ref) {
                ref.current = inst;
            }
        }
    };
};

// IE doesn't seem to get the composite computed value (eg: 'padding',
// 'borderStyle', etc.), so generate these from the individual values.
export function interpolateStyle(
    styles,
    attr,
    subattr = ''
) {
    // Title-case the sub-attribute.
    if (subattr) {
        subattr = subattr.replace(subattr[0], subattr[0].toUpperCase());
    }

    return ['Top', 'Right', 'Bottom', 'Left']
        // @ts-ignore: (attr + dir + subattr) property cannot be determined at compile time
        .map((dir) => styles[attr + dir + subattr])
        .join(' ');
}

export function sortAsc(a, b) {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

export function getFirstDuplicateOption(array) {
    let tracker = {};

    for (let i = 0; i < array.length; i++) {
        if (tracker[array[i].label]) {
            return array[i].label;
        }

        tracker[array[i].label] = true;
    }

    return null;
}