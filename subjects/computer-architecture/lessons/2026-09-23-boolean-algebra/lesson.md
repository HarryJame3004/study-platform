---
title: "Boolean Algebra"
date: "2026-09-23"
subject: "computer-architecture"
---

# Learning Objectives

After this lesson, you should understand:

- Boolean values in digital circuits.
- AND, OR, NOT operations.
- Boolean laws used for simplification.
- SOP and POS forms.
- Minterm, Maxterm, and canonical forms.

# Lesson

## Boolean Algebra

Boolean algebra is used to describe and simplify digital circuits using Boolean values.

Boolean operations include:

- AND
- OR
- NOT

# Important Concepts

## Boolean Laws

Identity:

A + 0 = A

A · 1 = A

Dominance:

A + 1 = 1

A · 0 = 0

Complement:

A + A' = 1

A · A' = 0

Absorption:

A + AB = A

A(A+B)=A

DeMorgan:

(A+B)' = A'B'

(AB)' = A'+B'

# SOP and POS

SOP means Sum of Products.

POS means Product of Sums.

# Minterm and Maxterm

Minterm is a product term containing all variables.

Rule:

0 -> complement
1 -> normal

Maxterm is a sum term containing all variables.

Rule:

0 -> normal
1 -> complement

# Canonical Forms

Canonical SOP uses rows where F=1 and Sigma m.

Canonical POS uses rows where F=0 and Pi M.

# Summary

Boolean algebra provides rules to simplify digital logic expressions and represent circuits mathematically.
