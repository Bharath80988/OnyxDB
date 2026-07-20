from setuptools import setup, find_packages

import os

# Read the README.md for the long description
with open(os.path.join(os.path.dirname(__file__), "README.md"), "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name='onyxdb',
    version='0.1.4',
    description='The Multi-Table Omni-Channel Database built on B+ Trees.',
    long_description=long_description,
    long_description_content_type='text/markdown',
    author='Bharath',
    packages=find_packages(),
    entry_points={
        'console_scripts': [
            'onyxdb=onyxdb.cli:main',
        ],
    },
    install_requires=[
        'requests'
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)
