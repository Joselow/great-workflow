const TAGS_PREFIX = "reunión, ";
const TAGS_LIMIT = 255;
const CLOSER_TAIL = new Set([".", ",", ";", ":", "!", "?"]);

type Span = { inner: string; end: number };

const FORMS = [
    { open: "*_", close: "_*" },
    { open: "_*", close: "*_" },
    { open: "*", close: "*" },
    { open: "_", close: "_" },
] as const;

const isSpace = (char: string | undefined): boolean => char !== undefined && /\s/.test(char);

const closerFits = (line: string, closeEnd: number): boolean => {
    if (closeEnd >= line.length) return true;

    const next = line[closeEnd];
    return isSpace(next) || CLOSER_TAIL.has(next ?? "");
};

const spanAt = (line: string, index: number): Span | null => {
    if (index > 0 && !isSpace(line[index - 1])) return null;

    for (const form of FORMS) {
        if (!line.startsWith(form.open, index)) continue;

        const innerStart = index + form.open.length;
        let searchFrom = innerStart;

        while (searchFrom < line.length) {
            const closeAt = line.indexOf(form.close, searchFrom);
            if (closeAt === -1) break;

            const closeEnd = closeAt + form.close.length;
            if (closerFits(line, closeEnd)) {
                return { inner: line.slice(innerStart, closeAt), end: closeEnd };
            }

            searchFrom = closeAt + 1;
        }
    }

    return null;
};

const sameWord = (value: string) => value.toLocaleLowerCase("es");

export function objectiveKeywords(objective: string): string[] {
    const keywords: string[] = [];
    const seen = new Set<string>();

    for (const line of objective.split(/\r?\n/)) {
        let index = 0;

        while (index < line.length) {
            const span = spanAt(line, index);
            if (!span) {
                index += 1;
                continue;
            }

            index = span.end;
            const word = span.inner.trim();
            if (!word) continue;

            const key = sameWord(word);
            if (seen.has(key)) continue;

            seen.add(key);
            keywords.push(word);
        }
    }

    return keywords;
}

export function nextStepTags(projectName: string, objective: string): string {
    const room = TAGS_LIMIT - TAGS_PREFIX.length;
    const project = projectName.trim().slice(0, Math.max(room, 0));
    let tags = `${TAGS_PREFIX}${project}`.slice(0, TAGS_LIMIT);
    const skip = new Set(["reunión", sameWord(projectName.trim())].filter((item) => item.length > 0));

    for (const word of objectiveKeywords(objective)) {
        if (skip.has(sameWord(word))) continue;

        const next = `${tags}, ${word}`;
        if (next.length > TAGS_LIMIT) break;

        tags = next;
    }

    return tags;
}
