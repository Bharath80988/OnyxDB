from setuptools import setup, find_packages

setup(
    name='onyxdb',
    version='0.1.0',
    description='The Multi-Table Omni-Channel Database built on B+ Trees.',
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
