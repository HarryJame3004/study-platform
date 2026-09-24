# Calculus - Limits

## Topic
Sequence Limits

## 1. Idea

Limit describes where a sequence is heading when n becomes very large.

If:

\[
\lim_{n\to\infty} a_n=A
\]

and:

\[
\lim_{n\to\infty} b_n=B
\]

then we can combine limits using limit laws.

## Limit Laws

### Addition

\[
\lim(a_n+b_n)=A+B
\]

### Subtraction

\[
\lim(a_n-b_n)=A-B
\]

### Multiplication

\[
\lim(a_nb_n)=AB
\]

### Division

\[
\lim\frac{a_n}{b_n}=\frac AB
\]

Condition:

\[
B\neq0
\]

## Divide by Dominant Term

Example:

\[
\lim_{n\to\infty}\frac{3n^2+2n+1}{5n^2+7}
\]

Divide numerator and denominator by \(n^2\):

\[
\frac{3+\frac2n+\frac1{n^2}}{5+\frac7{n^2}}
\]

Since:

\[
\frac1n\to0
\]

Result:

\[
\frac35
\]
