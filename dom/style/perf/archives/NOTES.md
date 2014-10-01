=============================
Performance tests conclusions
=============================

After having tried several implementations & strategies, here are some notes about these tests. I left the candidates that have not been retained in this folder for reference.

The main conclusion is that incrementally changing style rules is pretty slow when doing mass changes (typically during initialization). Solutions for grouping changes were the most significant in terms of performance gain.


StyleManyTags
=============

One <style> tag appended to document for each Style object.

Bad performance when loading many styles. Noted no difference otherwise when applying a style compared to a monolithic stylesheet (see legacy-comparison.html)

StyleOneTagManyTextNodes
========================

One <style> tag for all styles, one "textNode" per Style object.

Even worse performance when loading many styles. Still no difference otherwise when applying a style.

StyleOneTextNode
================

One <style> tag and one textNode for all styles. Style rules are concatenated into a string at each update and set as textNode.textContent
A bit speedier for creating styles but not very significant and less elegant in my opinion.


Manual strategy
===============

Manually calling a (singleton) method for committing all styles changes. Gives more control to the user (developer).

Lazy strategy
============

Deferring the attachment of all styles to the document only at the 1st "style.apply(node)". The easiest solution from a usage point of view for classic use cases.