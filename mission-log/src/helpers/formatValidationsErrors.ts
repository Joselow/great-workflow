type FieldErrors = Record<string, string[]>;

export function formatErrorsToHtml(errors: FieldErrors): string {
  const fields = Object.keys(errors);
  if (!fields.length) return '';

  const title = '<h3 class="font-semibold text-white">Correct errors</h3>';

  const body = fields
    .map((field) => {
      const fieldErrors = errors[field];
      if (!fieldErrors?.length) return '';

      const list = fieldErrors
        .map((error) => `<li>${error}</li>`)
        .join('');

      return `
        <div class="mb-2">
          <p class="font-medium text-gray-100 capitalize">${field}</p>
          <ul class="list-disc list-inside text-gray-200">${list}</ul>
        </div>
      `;
    })
    .join('');

  return `<div>
            ${title}
            <hr class="py-1 px-0 text-gray-100/20">
            ${body}
          </div>`;
}