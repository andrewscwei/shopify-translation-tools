# Shopify Translation Tools

A set of low level tools for managing translations stored in the  Shopify Translation API.

## Usage

The following generates a template for translation mutations for a single locale, and it requires that you already have the translatable resources fetched and stored in `<in_file>`.

```sh
$ npm run mutations -- <in_file> <out_file>
```

An example of how to retrieve translatable resources for a given resource type is by executing the following GraphQL query:

```graphql
{
  translatableResources(first: 100, resourceType: PRODUCT) {
    edges {
      node {
        resourceId
        translatableContent {
          key
          value
          digest
          locale
        }
        translations(locale: "fr") {
          key
          value
          locale
        }
      }
    }
  }
}
```

The results will be generated to `<out_file>` in JSON format, which you directly edit all the `value` entries prior to using the generated objects as variables for a `CreateTranslation` operation, like so:

```graphql
mutation CreateTranslation($id: ID!, $translations: [TranslationInput!]!) {
  translationsRegister(resourceId: $id, translations: $translations) {
    userErrors {
      message
      field
    }
    translations {
      locale
      key
      value
    }
  }
}
```

For more information please refer to the official Shopify docs: https://shopify.dev/api/examples/i18n-online-store-translations.
