# shoplist

This example implements the domain logic of the shoplist application.

This example comes with tests covering 100% of the source code.

The domain is built arround two aggregates:

- the items
- the suggestions

An item can be added to the list of things to buy.
An added item can be removed, its quantity can be updated and it can be marked as bought or not bought.
When an item is added, its label is added to a suggestion list.

# gulp tasks

```shell
gulp test-shoplist

```