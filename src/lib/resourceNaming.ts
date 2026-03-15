export const CLASS_NOTES_MODULE_PATTERN = /^.+\s+(?:(?:module|mod)\s*[1-5]|m\s*[1-5])$/i;

export function getClassNotesSubjectError(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return "Enter the subject name and module, for example: Operating Systems MOD 1.";
    }

    if (!CLASS_NOTES_MODULE_PATTERN.test(trimmed)) {
        return "Enter the subject name followed by a module number from 1 to 5, for example: Operating Systems MOD 1 or Operating Systems M1.";
    }

    return null;
}